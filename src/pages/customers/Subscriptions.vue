<template>
  <q-page padding class="neutral-background">
    <template v-if="customer !== {}">
      <div class="q-mb-lg">
        <p class="title">Souscriptions</p>
        <p v-if="subscriptions.length === 0">Aucun service souscrit.</p>
        <q-card v-if="subscriptions.length > 0" class="contract-card">
          <q-table :data="subscriptions" :columns="subscriptionsColumns" row-key="name" hide-bottom binary-state-sort
            class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat round small color="grey" icon="history" @click="showHistory(col.value)" />
                    <q-btn :disable="!getFunding(col.value)" flat round small color="grey" icon="mdi-calculator"
                      @click="showFunding(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
        </q-card>
        <p v-if="subscriptions.length > 0" class="nota-bene">* intègre les éventuelles majorations
          soir / dimanche</p>
        <div v-if="subscriptions && subscriptions.length > 0" class="row">
          <div class="col-xs-12">
            <q-checkbox v-model="customer.subscriptionsAccepted" class="q-mr-sm" @input="confirmAgreement"
              :disable="customer.subscriptionsAccepted" />
            <span style="vertical-align: middle">J'accepte les conditions d’abonnement présentées ci-dessus ainsi que
              les <a href="#cgs" @click.prevent="cgsModal = true">conditions générales de services
                Alenvi</a>.<span class="text-weight-thin text-italic"> {{ agreement }}</span></span>
          </div>
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Justificatifs APA ou autres financements</p>
        <ni-multiple-files-uploader path="financialCertificates" alt="justificatif financement"
          @uploaded="documentUploaded" name="financialCertificates" collapsible-label="Ajouter un justificatif"
          :user-profile="customer" :url="docsUploadUrl" @delete="deleteDocument($event)"
          additional-fields-name="financialCertificate" />
      </div>
      <div class="q-mb-lg">
        <p class="title">Paiement</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom associé au compte bancaire" v-model="customer.payment.bankAccountOwner"
            :error="$v.customer.payment.bankAccountOwner.$error" @focus="saveTmp('payment.bankAccountOwner')"
            @blur="updateCustomer('payment.bankAccountOwner')" />
          <ni-input caption="IBAN" v-model="customer.payment.iban" :error="$v.customer.payment.iban.$error"
            :error-label="ibanError" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')" />
          <ni-input caption="BIC" v-model="customer.payment.bic" :error="$v.customer.payment.bic.$error"
            :error-label="bicError" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')" />
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Mandats de prélèvement</p>
        <p v-if="customer.payment.mandates.length === 0 || !isValidPayment">Aucun mandat.</p>
        <q-card v-if="isValidPayment && customer.payment.mandates.length > 0" class="contract-card">
          <q-table :data="customer.payment.mandates" :columns="columnsMandates" row-key="name" hide-bottom
            :pagination.sync="pagination" :visible-columns="visibleColumnsMandates" binary-state-sort
            class="table-responsive">
            <q-td slot="body-cell-rum" slot-scope="props" :props="props" :data-label="props.col.label">{{ props.value }}
            </q-td>
            <q-td slot="body-cell-sign" slot-scope="props" :props="props" :data-label="props.col.label">
              <p class="no-margin" v-if="props.row.signedAt">Mandat signé le
                {{$moment(props.row.signedAt).format('DD/MM/YYYY')}}</p>
              <q-btn v-else-if="props.row.__index === customer.payment.mandates.length - 1" color="primary"
                @click="preOpenESignModal(props.row)">
                Signer
              </q-btn>
            </q-td>
          </q-table>
        </q-card>
      </div>
    </template>
    <template v-else>
      <p>Vous n'avez pas de bénéficiaire.</p>
    </template>

    <!-- Mandate signature modal -->
    <q-modal v-model="newESignModal" @hide="checkMandates" content-classes="e-sign-modal-container">
      <q-modal-layout>
        <q-toolbar class="no-shadow row justify-end toolbar-padding" color="black" inverted slot="header">
          <q-icon class="cursor-pointer" name="clear" size="1.5rem" @click.native="newESignModal = false" />
        </q-toolbar>
        <iframe :src="embeddedUrl" frameborder="0" class="iframe-normal"></iframe>
      </q-modal-layout>
    </q-modal>

    <!-- CSG modal -->
    <q-modal v-model="cgsModal" content-classes="csg-modal-container">
      <q-modal-layout>
        <q-toolbar class="no-shadow row justify-between toolbar-padding" color="black" inverted slot="header">
          <h5 class="no-margin">Conditions Générales de Service Alenvi</h5>
          <q-icon class="cursor-pointer" name="clear" size="1.5rem" @click.native="cgsModal = false" />
        </q-toolbar>
        <div v-html="cgs" class="modal-padding"></div>
      </q-modal-layout>
    </q-modal>

    <!-- Subscription history modal -->
    <ni-modal v-model="subscriptionHistoryModal" @hide="resetSubscriptionHistoryData">
      <template slot="title">
        Historique de la souscription <span class="text-weight-bold">{{selectedSubscription.service &&
          selectedSubscription.service.name}}</span>
      </template>
      <q-table class="q-mb-xl table-responsive" :data="selectedSubscription.versions"
        :columns="subscriptionHistoryColumns" hide-bottom binary-state-sort :pagination.sync="paginationHistory">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </ni-modal>

    <!-- Funding modal -->
    <ni-modal v-model="fundingModal" @hide="resetFundingData" title="Financement">
      <q-table class="q-mb-xl table-grid" :data="fundingData" :columns="fundingColumns" hide-bottom binary-state-sort
        :rows-per-page-options="[0]" :visible-columns="fundingVisibleColumns">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </ni-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import esign from '../../api/Esign.js';
import Input from '../../components/form/Input';
import MultipleFilesUploader from '../../components/form/MultipleFilesUploader.vue';
import Modal from '../../components/Modal';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify';
import { FIXED, REQUIRED_LABEL } from '../../data/constants';
import { bic, iban } from '../../helpers/vuelidateCustomVal';
import { getLastVersion } from '../../helpers/utils';
import { customerMixin } from '../../mixins/customerMixin.js';
import { subscriptionMixin } from '../../mixins/subscriptionMixin.js';
import { financialCertificatesMixin } from '../../mixins/financialCertificatesMixin.js';
import { fundingMixin } from '../../mixins/fundingMixin.js';
import cgs from '../../statics/CGS.html';

export default {
  name: 'Subscriptions',
  metaInfo: { title: 'Souscriptions' },
  components: {
    'ni-input': Input,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-modal': Modal,
  },
  mixins: [customerMixin, subscriptionMixin, financialCertificatesMixin, fundingMixin],
  data () {
    return {
      cgs,
      cgsModal: false,
      agreed: false,
      customer: {
        payment: { mandates: [] },
        subscriptions: [],
        quotes: [],
        financialCertificates: [],
        identity: {},
      },
      tmpInput: null,
      newESignModal: false,
      embeddedUrl: '',
      columnsMandates: [
        {
          name: 'rum',
          label: 'RUM',
          align: 'left',
          field: 'rum',
        },
        {
          name: 'sign',
          label: 'Signature',
          align: 'left',
          field: 'signedAt',
        },
        {
          name: 'createdAt',
          align: 'left',
          field: 'createdAt',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
        {
          name: '_id',
          field: '_id',
        },
      ],
      visibleColumnsMandates: ['rum', 'sign'],
      fundingModal: false,
      fundingData: [],
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
    }
  },
  validations: {
    customer: {
      payment: {
        bankAccountOwner: { required },
        bic: { required, bic },
        iban: { required, iban },
      },
    },
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.iban.iban) {
        return 'IBAN non valide';
      }
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.bic.bic) {
        return 'BIC non valide';
      }
    },
    agreement () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `(Accepté le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy})`;
      }
    },
    esignRedirection () {
      if (this.$q.platform.is.desktop) {
        return {
          redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
          redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`,
        }
      }
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`,
      }
    },
    isValidPayment () {
      return this.$v.customer.payment.bic.bic && this.$v.customer.payment.iban.iban
    },
    docsUploadUrl () {
      return this.customer.driveFolder ? `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}/upload` : '';
    },
    fundingVisibleColumns () {
      if (this.selectedFunding.nature === FIXED) {
        return ['thirdPartyPayer', 'folderNumber', 'startDate', 'frequency', 'amountTTC', 'customerParticipationRate'];
      }
      return ['thirdPartyPayer', 'folderNumber', 'startDate', 'frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate'];
    },
  },
  async mounted () {
    await this.refreshCustomer();
    await this.checkMandates();
  },
  methods: {
    async refreshCustomer () {
      try {
        this.customer = await this.$customers.getById(this.helper.customers[0]._id);
        this.refreshSubscriptions();
        this.refreshFundings();

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
    // Customer
    async updateCustomer (path) {
      try {
        let value = this.$_.get(this.customer, path);
        if (this.tmpInput === value) return;

        this.$_.get(this.$v.customer, path).$touch();
        if (this.$_.get(this.$v.customer, path).$error) return NotifyWarning('Champ(s) invalide(s)');

        if (path.match(/iban/i)) value = value.split(' ').join('');

        await this.$customers.updateById(this.customer._id, this.$_.set({}, path, value));
        await this.$store.dispatch('main/getUser', this.helper._id);
        await this.refreshCustomer();
        NotifyPositive('Modification enregistrée');

        if (path.match(/iban/i)) {
          this.$v.customer.payment.bic.$touch();
          if (!this.$v.customer.payment.bic.required) return NotifyWarning('Merci de renseigner votre BIC');
        }
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    // Subscriptions
    async confirmAgreement () {
      try {
        if (this.customer.subscriptionsAccepted) {
          const subscriptions = this.customer.subscriptions.map(subscription => {
            const lastVersion = getLastVersion(subscription.versions, 'createdAt');
            const obj = {
              service: subscription.service.name,
              unitTTCRate: lastVersion.unitTTCRate,
              estimatedWeeklyVolume: lastVersion.estimatedWeeklyVolume,
              startDate: lastVersion.startDate,
            };
            if (lastVersion.evenings) obj.evenings = lastVersion.evenings;
            if (lastVersion.sundays) obj.sundays = lastVersion.sundays;
            return obj;
          });
          const payload = {
            subscriptions,
            helper: {
              firstname: this.helper.identity.firstname || '',
              lastname: this.helper.identity.lastname || '',
              title: this.helper.identity ? this.helper.identity.title : '',
            },
          };
          await this.$customers.addSubscriptionHistory(this.customer._id, payload);
          await this.refreshCustomer();
          NotifyPositive('Abonnement validé');
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la validation de votre abonnement');
        this.customer.subscriptionsAccepted = !this.customer.subscriptionsAccepted
      }
    },
    // Mandate
    async preOpenESignModal (data) {
      try {
        this.$q.loading.show({ message: 'Contact du support de signature en ligne...' });
        const signatureRequest = await this.$customers.generateMandateSignatureRequest({ mandateId: data._id, _id: this.customer._id }, {
          customer: {
            name: this.customer.identity.lastname,
            email: this.helper.local.email,
          },
          fileId: this.helper.company.customersConfig.templates.debitMandate.driveId,
          fields: {
            bankAccountOwner: this.customer.payment.bankAccountOwner || '',
            customerAddress: this.customer.contact.primaryAddress.fullAddress || '',
            ics: this.helper.company.ics || '',
            rum: data.rum || '',
            bic: this.customer.payment.bic || '',
            iban: this.customer.payment.iban || '',
            companyName: this.helper.company.name || '',
            companyAddress: this.helper.company.address.fullAddress || '',
            downloadDate: this.$moment().format('DD/MM/YYYY'),
          },
          ...this.esignRedirection,
        });
        await this.refreshCustomer();
        this.embeddedUrl = signatureRequest.embeddedUrl;
        if (this.$q.platform.is.mobile) {
          window.location.href = this.embeddedUrl;
        } else {
          this.newESignModal = true;
        }
      } catch (e) {
        console.error(e);
        this.$q.loading.hide();
        this.newESignModal = false;
        NotifyNegative('Erreur lors de la requête de signature en ligne du mandat');
      } finally {
        this.$q.loading.hide();
      }
    },
    async checkMandates () {
      try {
        if (this.customer.payment.mandates.length === 0) return;
        const mandates = this.customer.payment.mandates.filter(mandate => !mandate.drive && mandate.everSignId);
        if (mandates.length === 0) return;
        for (const mandate of mandates) {
          const hasSigned = await this.hasSignedDoc(mandate.everSignId);
          if (hasSigned) {
            await this.$customers.saveSignedDoc({ _id: this.customer._id, mandateId: mandate._id });
          }
        }
        await this.refreshCustomer();
      } catch (e) {
        console.error(e);
      }
    },
    async hasSignedDoc (docId) {
      try {
        const document = await esign.getDocument(docId);
        return document.log.some(el => el.event === 'document_signed');
      } catch (e) {
        console.error(e);
      }
    },
    getFunding (subscriptionId) {
      return this.fundings.find(fund => fund.subscription._id === subscriptionId);
    },
    showFunding (subscriptionId) {
      this.selectedFunding = this.getFunding(subscriptionId);
      this.fundingData.push(this.selectedFunding);
      this.fundingModal = true;
    },
    resetFundingData () {
      this.selectedFunding = {};
      this.fundingData = [];
      this.fundingModal = false;
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .title
    font-size: 1.5em
    margin-bottom: 20px
  .nota-bene
    font-size: 0.8em
    margin-bottom: 20px
  .contract-card
    background: white
    width: 100%
    margin-bottom: 10px

  .toolbar-padding
    padding: 20px 58px

  /deep/ .q-layout-header
    box-shadow: none

  .iframe-normal
    position: absolute
    width: 100%
    height:100%

  .q-card-container
    padding: 0

  /deep/ .e-sign-modal-container
    min-width: 80vw
    min-height: 90vh

  /deep/ .csg-modal-container
    min-width: 60vw
    max-width: 60vw
    min-height: 70vh
    overflow: hidden
</style>
