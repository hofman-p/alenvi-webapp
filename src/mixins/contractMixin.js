import nationalities from '../data/nationalities.js';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../components/popup/notify';
import { required, minValue } from 'vuelidate/lib/validators';
import { minDate } from '../helpers/vuelidateCustomVal';
import { COMPANY_CONTRACT, CUSTOMER_CONTRACT } from '../data/constants';
import { generateContractFields } from '../helpers/generateContractFields.js';
import { translate } from '../data/translate';

export const contractMixin = {
  data () {
    return {
      timeout: null,
    }
  },
  validations () {
    return {
      newVersion: {
        weeklyHours: { required },
        startDate: { required },
        grossHourlyRate: { required },
      },
      editedVersion: {
        grossHourlyRate: { required, minValue: minValue(0) },
        startDate: { required, minDate: this.editedVersionMinStartDate ? minDate(this.editedVersionMinStartDate) : '' },
      },
    }
  },
  methods: {
    isVersionUpdated () {
      if (this.selectedVersion.grossHourlyRate !== this.editedVersion.grossHourlyRate) return true;
      if (!this.$moment(this.selectedVersion.startDate).isSame(this.editedVersion.startDate)) return true;

      return !!this.$_.get(this.selectedVersion, 'signature.eversignId') !== this.editedVersion.shouldBeSigned;
    },
    async getSignaturePayload (contract, title, template) {
      const signature = {
        ...this.esignRedirection,
        templateId: template.driveId,
        meta: { status: contract.status, auxiliaryDriveId: this.getUser.administrative.driveFolder.driveId },
        fields: generateContractFields(
          contract.status,
          { user: this.getUser, contract: contract, initialContractStartDate: this.selectedContract.startDate }
        ),
      }

      if (contract.status === CUSTOMER_CONTRACT) {
        const helpers = await this.$users.showAll({ customers: contract.customer });
        const currentCustomer = helpers[0].customers.find(cus => cus._id === contract.customer);
        signature.signers = this.generateContractSigners({ name: helpers[0].identity.lastname, email: helpers[0].local.email });
        signature.title = `${translate[contract.status]} - ${currentCustomer.identity.lastname}`;
        signature.meta.customerDriveId = currentCustomer.driveFolder.driveId;
      } else {
        signature.signers = this.generateContractSigners(
          { name: `${this.mainUser.identity.firstname} ${this.mainUser.identity.lastname}`, email: this.mainUser.local.email }
        );
        signature.title = `${title}${translate[contract.status]} - ${this.userFullName}`;
      }

      return signature;
    },
    getVersionTemplate (contract) {
      return contract.status === COMPANY_CONTRACT
        ? this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCompanyVersion')
        : this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCustomerVersion');
    },
    async getVersionEditionPayload () {
      const payload = this.$_.pick(this.editedVersion, ['startDate', 'grossHourlyRate']);
      if (this.editedVersion.shouldBeSigned) {
        const versionMix = { ...this.selectedContract, ...this.editedVersion };
        const template = this.getVersionTemplate(versionMix);
        payload.signature = await this.getSignaturePayload(versionMix, 'Avenant au ', template);
      }

      return this.$_.pickBy(payload);
    },
    async editVersion () {
      try {
        if (!this.isVersionUpdated) return this.resetVersionEditionModal();
        if (this.isPreviousPayImpacted) {
          await this.$q.dialog({
            title: 'Confirmation',
            message: 'Ce changement impacte une paie déjà effectuée. Vérifiez que vous ne pouvez pas créer un avenant prenant effet ce mois-ci. Confirmez-vous ce changement ?',
            ok: true,
            cancel: 'Annuler',
          });
        }

        this.$v.editedVersion.$touch();
        if (this.$v.editedVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = await this.getVersionEditionPayload();
        const params = { contractId: this.editedVersion.contractId, versionId: this.editedVersion.versionId }
        await this.$contracts.updateVersion(params, payload);
        await this.refreshContracts();

        this.resetVersionEditionModal();
        NotifyPositive('Contrat modifié');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Edition annulée');
        if (e.data && e.data.statusCode === 422) {
          this.$v.editedVersion.$reset();
          return NotifyNegative('La date de début du contrat doit etre antérieure aux évènements de l\'auxiliaire.');
        }
        NotifyNegative('Erreur lors de l\'edition du contrat');
      } finally {
        this.loading = false;
      }
    },
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
    async refreshContractsWithTimeout () {
      await this.refreshContracts();
      this.timeout = setTimeout(() => this.refreshContracts(), 10000);
    },
  },
};
