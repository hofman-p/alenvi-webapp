<template>
  <div>
    <div class="q-mb-xl">
      <div v-if="!isAuxiliary" class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
      </div>
      <q-table :data="payDocuments" :columns="columns" hide-bottom :pagination="pagination"
        class="q-pa-sm large-table">
        <q-td slot="body-cell-actions" slot-scope="props" :props="props">
          <div class="row justify-center table-actions">
            <q-btn flat round small color="primary" :disabled="!props.row.file.link" class="q-mx-sm" :disable="loading">
              <a :href="props.row.file.link || false" target="_blank">
                <q-icon name="file download" color="primary" />
              </a>
            </q-btn>
            <q-btn v-if="!isAuxiliary" flat round small color="primary" icon="delete" class="q-mx-sm" :disable="loading"
              @click="deletePayDocument(payDocuments[props.row.__index])">
            </q-btn>
          </div>
        </q-td>
      </q-table>
      <div v-if="payDocuments.length === 0" class="q-px-md q-my-sm">
        <span class="no-document">Aucun document</span>
      </div>
      <q-btn v-if="!isAuxiliary" class="fixed fab-custom" no-caps rounded color="primary" icon="add"
        label="Ajouter un document" @click="documentUpload = true" :disable="loading" />

      <!-- Document upload modal -->
      <ni-modal v-model="documentUpload" @hide="$refs.documentUploadForm.reset()">
        <template slot="title">
          Ajouter un <span class="text-weight-bold">document</span>
        </template>
        <ni-document-upload inModal :natureOptions="documentNatureOptions" v-model="newDocument"
          ref="documentUploadForm" @valid="formValid = $event">
        </ni-document-upload>
        <template slot="footer">
          <q-btn no-caps class="full-width modal-btn" label="Ajouter le document" icon-right="add"
            color="primary" :loading="loading" @click="createDocument" />
        </template>
      </ni-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import snakeCase from 'lodash/snakeCase';

import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';
import { PAY_DOCUMENT_NATURES, OTHER, AUXILIARY_ROLES, COACH_ROLES } from '../../data/constants';
import Modal from '../../components/Modal';
import DocumentUpload from '../../components/documents/DocumentUpload';
import PayDocuments from '../../api/PayDocuments';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ProfilePay',
  components: {
    'ni-document-upload': DocumentUpload,
    'ni-modal': Modal,
  },
  data () {
    return {
      documentUpload: false,
      documentNatureOptions: PAY_DOCUMENT_NATURES,
      loading: false,
      newDocument: null,
      formValid: false,
      payDocuments: [],
      columns: [
        {
          name: 'nature',
          label: 'Type',
          align: 'left',
          field: 'nature',
          format: value => this.documentNatureLabels[value],
        },
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: row => row,
        },
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        rowsPerPage: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
    }),
    documentNatureLabels () {
      const payDocumentNaturesKeyedByValue = this.$_.keyBy(PAY_DOCUMENT_NATURES, 'value');

      return this.$_.mapValues(payDocumentNaturesKeyedByValue, 'label');
    },
    userProfile () {
      if (AUXILIARY_ROLES.includes(this.mainUser.role.name)) return this.mainUser;
      if (COACH_ROLES.includes(this.mainUser.role.name)) return this.$store.getters['rh/getUserProfile'];
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.mainUser.role.name);
    },
    driveFolder () {
      return get(this.userProfile, 'administrative.driveFolder.driveId');
    },
  },
  async mounted () {
    await this.getDocuments();
  },
  methods: {
    formatDocumentPayload () {
      const { file, nature, date } = this.newDocument;
      const form = new FormData();
      const formattedDate = this.$moment(date).format('DD-MM-YYYY-HHmm');
      const documentOption = this.documentNatureOptions.find(option => option.value === this.newDocument.nature);
      const fileName = documentOption && this.newDocument.nature !== OTHER
        ? snakeCase(`${documentOption.label} ${formattedDate} ${formatIdentity(this.userProfile.identity, 'FL')}`)
        : snakeCase(`document_paie_${formattedDate}`);

      form.append('nature', nature);
      form.append('date', date.toISOString());
      form.append('payDoc', file);
      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('fileName', fileName);
      form.append('driveFolderId', this.driveFolder);
      form.append('user', this.userProfile._id);

      return form;
    },
    async createDocument () {
      if (!this.driveFolder) NotifyNegative('Dossier Google Drive manquant.')
      const isValid = await this.$refs.documentUploadForm.validate();
      if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

      this.loading = true;

      try {
        await PayDocuments.create(this.formatDocumentPayload());

        this.documentUpload = false;
        this.$refs.documentUploadForm.reset();
        NotifyPositive('Document sauvegardé');

        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de l'envoi du document");
      }

      this.loading = false;
    },
    async getDocuments () {
      try {
        this.payDocuments = await PayDocuments.list({ user: this.userProfile._id });
      } catch (e) {
        this.payDocuments = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des documents');
      }
    },
    async deletePayDocument (payDocument) {
      this.loading = true;
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        });

        await PayDocuments.remove(payDocument._id);
        NotifyPositive('Document supprimé');
        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
      this.loading = false;
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-card
    background: white;
    width: 100%;
    margin-bottom: 20px;
</style>
