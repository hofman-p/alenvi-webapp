<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Pratique</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Accès / codes" v-model="customer.contact.accessCodes" @focus="saveTmp('contact.accessCodes')"
          @blur="updateCustomer('contact.accessCodes')" />
        <ni-input v-if="isAuxiliary" caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error"
          error-label="Numéro de téléphone non valide" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-search-address v-if="isAuxiliary" caption='Adresse principale' v-model="customer.contact.primaryAddress"
          color="white" disable />
        <ni-search-address v-if="isAuxiliary && hasSecondaryAddress" caption='Adresse secondaire'
          v-model="customer.contact.secondaryAddress" color="white" disable />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Référent</p>
      </div>
      <div class="row">
        <img :src="auxiliaryAvatar" class="avatar">
        <q-select class='referent' :options="auxiliariesOptions" v-model="customer.referent._id"
          @input="updateCustomer('referent')" color="white" :filter-placeholder="auxiliaryPlaceholder"
          :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
          ref="auxiliarySelect" hide-underline filter @focus="saveTmp('referent')" :disable="loading"/>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Accompagnement</p>
      </div>
      <div class="row gutter-profile">
        <ni-input  caption="Environnement du bénéficiaire" v-model="customer.followUp.environment" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.environment')" @focus="saveTmp('followUp.environment')" />
        <ni-input  caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" />
        <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="1" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Aidants</p>
      </div>
      <q-table :data="sortedHelpers" :columns="helperColumns" row-key="name" :pagination="helperPagination"
        hide-bottom :visible-columns="visibleColumns">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'phone'">
              <a v-if="col.value" class="text-primary" :href="getPhoneLink(col.value)">{{col.value}}</a>
              <div v-else>{{ col.value }}</div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </div>
    <div class="q-mb-xl" v-if="customer.firstIntervention">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaires</p>
      </div>
      <q-table :data="customerFollowUp" :columns="followUpColumns" row-key="name" :pagination.sync="followUpPagination"
        :rows-per-page-options="[]" class="table-fixed">
        <q-td slot="body-cell-identity" slot-scope="props" :props="props">
          <q-item>
            <q-item-side :avatar="props.value.picture.link | getAvatar" />
            <q-item-main>
              <span class="identity-block q-mr-sm">{{ props.value.identity | formatIdentity('Fl') }}</span>
              <span class="identity-block">({{ props.value.sector.name }})</span>
            </q-item-main>
          </q-item>
        </q-td>
      </q-table>
    </div>
  </div>
</template>

<script>
import Input from '../form/Input';
import Select from '../form/Select';
import { NotifyNegative } from '../popup/notify.js';
import { AUXILIARY, PLANNING_REFERENT, AUXILIARY_ROLES, DEFAULT_AVATAR, UNKNOWN_AVATAR } from '../../data/constants';
import SearchAddress from '../form/SearchAddress';
import { extend, formatIdentity } from '../../helpers/utils.js';
import { customerMixin } from '../../mixins/customerMixin.js';
import { validationMixin } from '../../mixins/validationMixin.js';
import { helperMixin } from '../../mixins/helperMixin.js';
import { frPhoneNumber } from '../../helpers/vuelidateCustomVal';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
  },
  mixins: [customerMixin, validationMixin, helperMixin],
  data () {
    return {
      auxiliaries: [],
      isLoaded: false,
      customer: { followUp: {}, contact: {} },
      tmpInput: '',
      loading: false,
      visibleColumns: ['lastname', 'firstname', 'email', 'phone'],
      customerFollowUp: [],
      followUpColumns: [
        {
          name: 'identity',
          align: 'left',
          field: row => row,
        },
        {
          name: 'hours',
          align: 'center',
          label: 'Heures réalisées',
          field: row => `${Math.trunc(row.totalHours)}h`,
        },
        {
          name: 'lastEvent',
          align: 'center',
          label: 'Dernière inter.',
          field: row => this.$moment(row.lastEvent.startDate).format('DD/MM/YYYY'),
        },
      ],
      followUpPagination: { rowsPerPage: 5 },
    };
  },
  validations: {
    customer: {
      contact: {
        phone: { frPhoneNumber },
      },
    },
  },
  computed: {
    auxiliaryAvatar () {
      let auxiliaryPicture;
      if (this.customer.referent.picture) {
        auxiliaryPicture = this.customer.referent.picture;
      }
      return this.getAuxiliaryAvatar(auxiliaryPicture);
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.currentUser.role.name);
    },
    hasSecondaryAddress () {
      return !!this.$_.get(this.customer, 'contact.secondaryAddress.fullAddress');
    },
    auxiliariesOptions () {
      const auxiliariesOptions = [{ label: 'Pas de référent', value: '' }];
      if (this.auxiliaries.length) {
        auxiliariesOptions.push(...this.auxiliaries.map(aux => ({
          label: formatIdentity(aux.identity, 'FL'),
          value: aux._id,
        })));
      } else if (this.customer.referent._id) {
        auxiliariesOptions.push({
          label: formatIdentity(this.customer.referent.identity, 'FL'),
          value: this.customer.referent._id,
        });
      }

      return auxiliariesOptions;
    },
    auxiliaryPlaceholder () {
      return (this.customer.referent.identity)
        ? formatIdentity(this.customer.referent.identity, 'FL')
        : 'Pas de référent';
    },
  },
  async mounted () {
    await Promise.all([this.refreshCustomer(), this.getUserHelpers(), this.getAuxiliaries()])
    if (this.customer.firstIntervention) await this.getCustomerFollowUp();
  },
  methods: {
    getAuxiliaryAvatar (picture) {
      return picture ? this.$_.get(picture, 'link') || DEFAULT_AVATAR : UNKNOWN_AVATAR;
    },
    toggleAuxiliarySelect () {
      return this.$refs['auxiliarySelect'].show();
    },
    async getAuxiliaries () {
      try {
        this.loading = true;
        const activeAuxiliaries = await this.$users.showAllActive({ role: [AUXILIARY, PLANNING_REFERENT] });
        this.auxiliaries = activeAuxiliaries.filter(aux => aux.contracts.some(c => !c.endDate));
        this.loading = false;
      } catch (e) {
        this.auxiliaries = [];
        this.loading = false;
      }
    },
    async getCustomerFollowUp () {
      try {
        this.customerFollowUp = await this.$stats.getCustomerFollowUp({ customer: this.customer._id });
      } catch (e) {
        this.customerFollowUp = [];
        NotifyNegative('Erreur lors de la récupération des auxiliaires');
      }
    },
    async refreshCustomer () {
      try {
        if (this.$_.get(this.customer, 'referent._id', '') === '') this.customer.referent = { _id: '' };
        const customer = await this.$customers.getById(this.userProfile._id);
        this.mergeCustomer(customer);
        this.$store.commit('rh/saveUserProfile', this.customer);
        this.isLoaded = true;
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données');
      }
    },
    mergeCustomer (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      this.tmpInput = path === 'referent' ? this.$_.get(this.customer, 'referent._id', '') : this.$_.get(this.customer, path);
    },
    getPhoneLink (link) {
      return link ? `tel:+33${link.substring(1)}` : '-';
    },
  },
  filters: {
    formatIdentity,
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .identity-block
    display: inline-block;
    font-size: 12px;
  .q-item
    padding: 0;
  .table-fixed >>> table
    table-layout: fixed;
</style>
