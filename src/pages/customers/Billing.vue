<template>
  <q-page padding class="neutral-background">
    <ni-profile-billing v-if="customer" />
  </q-page>
</template>

<script>
import ProfileBilling from '../../components/customers/ProfileBilling.vue';

export default {
  name: 'Billing',
  metaInfo: { title: 'Facturation' },
  components: {
    'ni-profile-billing': ProfileBilling,
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
    },
    customer () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    if (!this.customer) {
      await this.refreshCustomer();
    }
  },
  methods: {
    async refreshCustomer () {
      try {
        const customer = await this.$customers.getById(this.helper.customers[0]._id);
        this.$store.commit('rh/saveUserProfile', customer);
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
