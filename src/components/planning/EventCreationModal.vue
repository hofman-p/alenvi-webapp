<template>
  <q-modal v-if="Object.keys(newEvent).length !== 0" :value="creationModal" content-classes="modal-container-md"
    @hide="resetForm(false)">
    <div class="modal-padding">
      <ni-planning-modal-header v-if="isCustomerPlanning" v-model="newEvent.customer" :selectedPerson="selectedCustomer"
        @close="close" />
      <ni-planning-modal-header v-else v-model="newEvent.auxiliary" :options="auxiliariesOptions"
        :selectedPerson="selectedAuxiliary" @close="close" />
      <q-btn-toggle no-wrap v-model="newEvent.type" toggle-color="primary" :options="eventTypeOptions"
        @input="resetForm(true, newEvent.type)" />
      <template v-if="newEvent.type !== ABSENCE">
        <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
          :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date />
      </template>
      <template v-if="newEvent.type === INTERVENTION">
        <ni-select v-if="isCustomerPlanning" in-modal caption="Auxiliaire" v-model="newEvent.auxiliary"
          :options="auxiliariesOptions" :error="validations.auxiliary.$error" required-field
          @blur="validations.auxiliary.$touch" @input="toggleServiceSelection()" />
        <ni-select v-else in-modal caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions"
          :error="validations.customer.$error" required-field @blur="validations.customer.$touch"/>
        <ni-select in-modal caption="Service" v-model="newEvent.subscription" :error="validations.subscription.$error"
          :options="customerSubscriptionsOptions" required-field @blur="validations.subscription.$touch" />
      </template>
      <template v-if="newEvent.type === ABSENCE">
        <ni-select in-modal caption="Nature" v-model="newEvent.absenceNature" :options="absenceNatureOptions"
          :error="validations.absenceNature.$error" required-field @blur="validations.absenceNature.$touch"
          @input="resetAbsenceType" />
        <template v-if="newEvent.absenceNature === DAILY">
          <ni-datetime-picker caption="Date de début" v-model="newEvent.dates.startDate" type="date" required-field
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.dates.endDate" type="date" required-field inModal
            :error="validations.dates.endDate.$error" @blur="validations.dates.endDate.$touch"
            :min="newEvent.dates.startDate" />
          <ni-select in-modal caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" />
          <ni-file-uploader v-if="newEvent.absence && [ILLNESS, WORK_ACCIDENT].includes(newEvent.absence)" caption="Justificatif d'absence"
            path="attachment" :entity="newEvent" alt="justificatif absence" name="file" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additionalValue="additionalValue" required-field withBorders
            @delete="deleteDocument(newEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="newEvent.absenceNature === HOURLY">
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
            disable-end-date :error="validations.dates.$error" @blur="validations.dates.$touch" />
          <ni-select in-modal caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" disable />
        </template>
      </template>
      <template v-if="newEvent.type === INTERNAL_HOUR">
        <ni-select in-modal caption="Type d'heure interne" v-model="newEvent.internalHour" :options="internalHourOptions"
          required-field :error="validations.internalHour.$error" @blur="validations.internalHour.$touch" />
      </template>
      <template v-if="newEvent.type !== ABSENCE && newEvent.repetition">
        <ni-select in-modal caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency"
          :options="repetitionOptions" required-field @blur="validations.repetition.frequency.$touch" :disable="!isRepetitionAllowed" />
      </template>
      <template v-if="newEvent.type === INTERNAL_HOUR">
        <ni-search-address v-model="newEvent.address" :error-label="addressError" @blur="validations.address.$touch"
          :error="validations.address.$error" inModal />
      </template>
      <ni-input in-modal v-model="newEvent.misc" caption="Notes" @blur="validations.misc.$touch"
        :error="validations.misc.$error" :required-field="newEvent.type === ABSENCE && newEvent.absence === OTHER" />
    </div>
    <div v-if="newEvent.type === INTERVENTION && customerAddressList(newEvent).length > 0" class="customer-info">
      <div class="row items-center no-wrap">
        <q-select v-model="newEvent.address" color="white" inverted-light :options="customerAddressList(newEvent)"
          :after="iconSelect(newEvent)" :filter-placeholder="newEvent.address.fullAddress" @input="deleteClassFocus"
          :readonly="customerAddressList(newEvent).length === 1" ref="addressSelect" filter />
      </div>
    </div>
    <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary"
      @click="createEvent" :disable="disableCreationButton" icon-right="add" />
  </q-modal>
</template>

<script>
import { ABSENCE, INTERNAL_HOUR, INTERVENTION, HOURLY, UNJUSTIFIED, CUSTOMER_CONTRACT, COMPANY_CONTRACT, NEVER } from '../../data/constants';
import { planningModalMixin } from '../../mixins/planningModalMixin';

export default {
  name: 'EventCreationModal',
  mixins: [planningModalMixin],
  props: {
    newEvent: { type: Object, default: () => ({}) },
    creationModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    activeAuxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    personKey: { type: String, default: () => '' },
  },
  computed: {
    isEndDurationRequired () {
      if (this.newEvent.type !== ABSENCE) return false;

      return this.$moment(this.newEvent.dates.endDate).isAfter(this.$moment(this.newEvent.dates.startDate));
    },
    isCompanyContractValidForRepetition () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = this.selectedAuxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);
      if (!companyContracts || companyContracts.length === 0) return false;

      return companyContracts.some(contract => !contract.endDate);
    },
    isCustomerContractValidForRepetition () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const correspContracts = this.selectedAuxiliary.contracts.find(ctr => ctr.customer === this.newEvent.customer);
      if (!correspContracts) return false;

      return correspContracts.some(contract => !contract.endDate);
    },
    isRepetitionAllowed () {
      if (!this.newEvent.auxiliary) return true;
      if (this.newEvent.subscription !== '' && this.newEvent.customer !== '' && this.newEvent.auxiliary !== '') {
        if (!this.selectedCustomer.subscriptions) return true;

        const selectedSubscription = this.selectedCustomer.subscriptions.find(sub => sub._id === this.newEvent.subscription);
        if (!selectedSubscription) return true;
        if (selectedSubscription.service.type === COMPANY_CONTRACT) return this.isCompanyContractValidForRepetition;
        if (selectedSubscription.service.type === CUSTOMER_CONTRACT) return this.isCustomerContractValidForRepetition;
      }

      return true;
    },
    selectedCustomer () {
      if (!this.newEvent.customer) return { identity: {} };
      return this.customers.find(customer => customer._id === this.newEvent.customer);
    },
    selectedAuxiliary () {
      if (!this.newEvent.auxiliary || !this.activeAuxiliaries.length) return { identity: {} };
      const aux = this.activeAuxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(aux, this.newEvent.dates.startDate);
      const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(aux, this.newEvent.dates.startDate);

      return { ...aux, hasCustomerContractOnEvent, hasCompanyContractOnEvent };
    },
  },
  watch: {
    selectedAuxiliary (value) {
      if (!this.selectedAuxiliary.hasCompanyContractOnEvent && this.newEvent.type === INTERNAL_HOUR) this.newEvent.type = INTERVENTION;
    },
    isRepetitionAllowed (value) {
      if (!value) this.newEvent.repetition.frequency = NEVER;
    },
    selectedCustomer () {
      this.newEvent.address = this.$_.get(this.selectedCustomer, 'contact.primaryAddress', {});
      if (this.customerSubscriptionsOptions.length === 1 && this.creationModal) this.newEvent.subscription = this.customerSubscriptionsOptions[0].value;
    },
  },
  methods: {
    toggleServiceSelection () {
      if (this.customerSubscriptionsOptions.length === 1 && this.creationModal) {
        this.newEvent.subscription = this.customerSubscriptionsOptions[0].value;
      }
    },
    close () {
      this.$emit('close');
    },
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    deleteDocument (value) {
      this.$emit('deleteDocument', value);
    },
    documentUploaded (value) {
      this.$emit('documentUploaded', value);
    },
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    resetAbsenceType () {
      if (this.newEvent.type === ABSENCE && this.newEvent.absenceNature === HOURLY) {
        this.newEvent.absence = UNJUSTIFIED;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .q-btn-toggle
    border: none;
    box-shadow: none;
    @media screen and (max-width: 767px)
      display: inline-flex;
      flex-wrap: wrap;
    & .q-btn-item
      width: 24%;
      border-radius: 20px;
      margin: 5px;
      background-color: $light-grey;
      @media screen and (max-width: 767px)
        width: 45%;

</style>
