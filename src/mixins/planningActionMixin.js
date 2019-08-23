import { NotifyWarning, NotifyNegative, NotifyPositive } from '../components/popup/notify';
import {
  INTERNAL_HOUR,
  ABSENCE,
  INTERVENTION,
  NEVER,
  UNAVAILABILITY,
  ILLNESS,
  CUSTOMER_CONTRACT,
  COMPANY_CONTRACT,
  DAILY,
  PLANNING_VIEW_START_HOUR,
  PLANNING_VIEW_END_HOUR,
  SECTOR,
  CUSTOMER,
} from '../data/constants';

export const planningActionMixin = {
  methods: {
    addSavedTerms (endPath) {
      if (this.$q.localStorage.has(`lastSearch${endPath}`) && this.$q.localStorage.get.item(`lastSearch${endPath}`).length > 0) {
        const lastSearch = JSON.parse(this.$q.localStorage.get.item(`lastSearch${endPath}`));
        if (this.$refs.planningManager) this.$refs.planningManager.restoreFilter(lastSearch);
      }
    },
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    hasActiveCustomerContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;

      const customerContracts = auxiliary.contracts.filter(contract => contract.status === CUSTOMER_CONTRACT);

      return customerContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isSameOrAfter(startDate));
      });
    },
    hasActiveCompanyContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;

      const companyContracts = auxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(startDate));
      });
    },
    getRowEvents (rowId) {
      const rowEvents = this.events.find(group => group._id === rowId);

      return (!rowEvents || !rowEvents.events) ? [] : rowEvents.events;
    },
    // Event creation
    canCreateEvent (person, selectedDay) {
      const hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(person, selectedDay);
      const hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(person, selectedDay);

      return hasActiveCustomerContractOnEvent || hasActiveCompanyContractOnEvent;
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
      this.$v.newEvent.$reset();
      if (!partialReset) this.newEvent = {};
      else {
        this.newEvent = {
          type,
          dates: {
            startDate: partialReset ? this.newEvent.dates.startDate : '',
            startHour: partialReset ? this.newEvent.dates.startHour : '',
            endDate: partialReset ? this.newEvent.dates.endDate : '',
            endHour: partialReset ? this.newEvent.dates.endHour : '',
          },
          repetition: { frequency: NEVER },
          auxiliary: partialReset ? this.newEvent.auxiliary : '',
          customer: '',
          subscription: '',
          sector: partialReset ? this.newEvent.sector : '',
          internalHour: '',
          absence: '',
          address: {},
          attachment: {},
          ...(type === ABSENCE && { absenceNature: DAILY }),
        };
      }
    },
    closeCreationModal () {
      this.creationModal = false;
    },
    getPayload (event) {
      let payload = { ...this.$_.omit(event, ['dates', '__v', '__index']) }
      payload = this.$_.pickBy(payload);

      if (event.auxiliary) {
        const auxiliary = this.auxiliaries.find(aux => aux._id === event.auxiliary);
        payload.sector = auxiliary.sector._id;
      }

      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }

      if (event.type === ABSENCE && event.absenceNature === DAILY) {
        payload.startDate = this.$moment(event.dates.startDate).hour(PLANNING_VIEW_START_HOUR).minute(0).toISOString();
        payload.endDate = this.$moment(event.dates.endDate).hour(PLANNING_VIEW_END_HOUR).minute(0).toISOString();
      } else {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.dates.startHour.split(':')[0])
          .minutes(event.dates.startHour.split(':')[1]).toISOString();
        payload.endDate = this.$moment(event.dates.endDate).hours(event.dates.endHour.split(':')[0])
          .minutes(event.dates.endHour.split(':')[1]).toISOString();
      }

      if (event.type === INTERVENTION) {
        const customer = this.customers.find(cus => cus._id === event.customer);
        if (customer) {
          const subscription = customer.subscriptions.find(sub => sub._id === event.subscription);
          if (subscription && subscription.service) payload.status = subscription.service.type;
        }
      }

      if (event.address) delete payload.address.location;
      if (event.type === ABSENCE && event.absence !== ILLNESS) payload.attachment = {};

      return payload;
    },
    getCreationPayload (event) {
      let payload = this.getPayload(event);

      if (event.address && !event.address.fullAddress) delete payload.address;
      if (event.type === ABSENCE && event.absence !== ILLNESS) payload.attachment = {};

      return payload;
    },
    isCreationAllowed (event) {
      if (event.type === ABSENCE) return true;
      if (event.type === INTERVENTION && event.repetition && event.repetition.frequency !== NEVER) return true;

      return !this.hasConflicts(event);
    },
    hasConflicts (scheduledEvent) {
      if (!scheduledEvent.auxiliary || scheduledEvent.isCancelled) return false;

      const auxiliaryEvents = this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate);
      return auxiliaryEvents.some(ev => {
        if ((scheduledEvent._id && scheduledEvent._id === ev._id) || ev.isCancelled) return false;
        return this.$moment(scheduledEvent.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          this.$moment(ev.startDate).isBetween(scheduledEvent.startDate, scheduledEvent.endDate, 'minutes', '[]');
      });
    },
    getAuxiliaryEventsBetweenDates (auxiliaryId, startDate, endDate) {
      return this.getRowEvents(auxiliaryId)
        .filter(event => {
          return this.$moment(event.startDate).isBetween(startDate, endDate, 'minutes', '[)') ||
            this.$moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '[)')
        });
    },
    async notifyCreation () {
      if (this.newEvent.type === ABSENCE) {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Les interventions en conflit avec l\'absence seront passées en à affecter et les autres évènements seront supprimés. Es-tu sûr(e) de vouloir créer cette absence ?',
          ok: 'OK',
          cancel: 'Annuler',
        });
      }

      if (this.newEvent.auxiliary && this.$_.get(this.newEvent, 'repetition.frequency', '') !== NEVER) {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Les interventions de la répétition en conflit avec les évènements existants seront passées en à affecter. Es-tu sûr(e) de vouloir créer cette répétition ?',
          ok: 'OK',
          cancel: 'Annuler',
        });
      }
    },
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.notifyCreation();

        this.loading = true;
        const payload = this.getCreationPayload(this.newEvent);
        if (!this.isCreationAllowed(payload)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }

        await this.$events.create(payload);

        await this.refresh();
        this.creationModal = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Création annulée');
        console.error(e);
        if (e.data && e.data.statusCode === 422) return NotifyNegative('La creation de cet evenement n\'est pas autorisée');
        NotifyNegative('Erreur lors de la création de l\'évènement');
      } finally {
        this.loading = false
      }
    },
    // Event edition
    formatHour (date) {
      return `${this.$moment(date).hours() < 10
        ? `0${this.$moment(date).hours()}`
        : this.$moment(date).hours()}:${this.$moment(date).minutes() || '00'}`;
    },
    formatEditedEvent (event) {
      const { createdAt, updatedAt, startDate, endDate, isBilled, auxiliary, subscription, ...eventData } = event;
      const dates = {
        startDate,
        endDate,
        startHour: this.formatHour(startDate),
        endHour: this.formatHour(endDate),
      };

      switch (event.type) {
        case INTERVENTION:
          const subscription = event.subscription._id;
          this.editedEvent = {
            isCancelled: false,
            cancel: {},
            shouldUpdateRepetition: false,
            ...eventData,
            dates,
            auxiliary: auxiliary ? auxiliary._id : '',
            subscription,
            isBilled,
          };
          break;
        case INTERNAL_HOUR:
          const internalHour = event.internalHour._id;
          this.editedEvent = { address: {}, shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, internalHour, dates };
          break;
        case ABSENCE:
          this.editedEvent = {
            address: {},
            attachment: {},
            ...eventData,
            auxiliary: auxiliary._id,
            dates,
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, dates };
          break;
      }
    },
    canEditEvent (event) {
      if (!event.auxiliary) { // Unassigned event
        return this.$can({
          user: this.$store.getters['main/user'],
          auxiliarySectorEvent: event.sector,
          permissions: [
            { name: 'planning:edit:user', rule: 'isInSameSector' },
          ],
        });
      }

      return this.$can({
        user: this.$store.getters['main/user'],
        auxiliaryIdEvent: event.auxiliary._id,
        auxiliarySectorEvent: event.sector,
        permissions: [
          { name: 'planning:edit:user', rule: 'isInSameSector' },
          { name: 'planning:edit', rule: 'isOwner' },
        ],
      });
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
    closeEditionModal () {
      this.editionModal = false;
    },
    getEditionPayload (event) {
      let payload = this.getPayload(event);

      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.attachment && Object.keys(event.attachment).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;

      return this.$_.omit(payload, ['customer', 'repetition', 'staffingLeft', 'staffingWidth', 'staffingTop', 'staffingHeight', 'type']);
    },
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getEditionPayload(this.editedEvent);

        if (this.hasConflicts(payload)) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }
        delete payload._id;
        await this.$events.updateById(this.editedEvent._id, payload);

        await this.refresh();
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement modifié');
      } catch (e) {
        console.error(e)
        if (e.data && e.data.statusCode === 422) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Cette modification n\'est pas autorisée');
        }
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    getDragAndDropPayload (toDay, target, draggedObject) {
      const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');
      const payload = {
        startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
          .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
          .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
      };

      if (target.type === SECTOR) payload.sector = target._id;
      else if (this.personKey === CUSTOMER) {
        payload.auxiliary = draggedObject.auxiliary._id;
        payload.sector = draggedObject.sector;
      } else {
        payload.auxiliary = target._id;
        const auxiliary = this.auxiliaries.find(aux => aux._id === target._id);
        payload.sector = auxiliary.sector._id;
      }

      return payload;
    },
    async updateEventOnDrop (vEvent) {
      try {
        const { toDay, target, draggedObject } = vEvent;

        if (this.personKey === CUSTOMER && target._id !== draggedObject.customer._id) {
          return NotifyNegative('Impossible de modifier le bénéficiaire de l\'intervention.');
        } else {
          if (target.type === SECTOR && draggedObject.type !== INTERVENTION) return NotifyNegative('Cette modification n\'est pas autorisée.');
          if ([ABSENCE, UNAVAILABILITY].includes(draggedObject.type) && draggedObject.auxiliary._id !== target._id) {
            return NotifyNegative('Impossible de modifier l\'auxiliaire de cet évènement.');
          }
        }

        const payload = this.getDragAndDropPayload(toDay, target, draggedObject);
        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }

        await this.$events.updateById(draggedObject._id, payload);
        await this.refresh();

        NotifyPositive('Évènement modifié');
      } catch (e) {
        if (e.data && e.data.statusCode === 422) return NotifyNegative('Cette modification n\'est pas autorisée');
      }
    },
    // Event files
    documentUploaded (uploadedInfo) {
      if (!uploadedInfo.xhr || !uploadedInfo.xhr.response) return;

      const json = JSON.parse(uploadedInfo.xhr.response);
      if (!json || !json.data || !json.data.payload) return;

      if (this.creationModal) this.newEvent.attachment = { ...json.data.payload.attachment };
      if (this.editionModal) this.editedEvent.attachment = { ...json.data.payload.attachment };
    },
    async deleteDocument (driveId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        });
        await this.$gdrive.removeFileById({ id: driveId });
        if (this.creationModal) this.newEvent.attachment = {};
        if (this.editionModal) this.editedEvent.attachment = {};
        NotifyPositive('Document supprimé');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    // Event deletion
    async deleteEvent () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cet évènement ?',
          ok: 'OK',
          cancel: 'Annuler',
        });

        this.loading = true
        await this.$events.deleteById(this.editedEvent._id);
        await this.refresh();
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
    async deleteEventRepetition () {
      try {
        const shouldDeleteRepetition = await this.$q.dialog({
          title: 'Confirmation',
          message: 'Supprimer l\'événement périodique',
          ok: 'OK',
          cancel: 'Annuler',
          options: {
            type: 'radio',
            model: false,
            items: [
              { label: 'Supprimer uniquement cet évenement', value: false },
              { label: 'Supprimer cet évenement et tous les suivants', value: true },
            ],
          },
        });

        this.loading = true
        if (shouldDeleteRepetition) {
          await this.$events.deleteRepetition(this.editedEvent._id);
          await this.refresh();
        } else {
          await this.$events.deleteById(this.editedEvent._id);
          await this.refresh();
        }

        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
  },
};
