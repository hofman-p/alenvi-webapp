<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <profile-header :customer="true" :profileId="id" class="header" />
      <profile-tabs :profileId="id" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import ProfileHeader from '../../../components/ProfileHeader';
import ProfileTabs from '../../../components/ProfileTabs';
import ProfileFollowUp from '../../../components/customers/ProfileFollowUp';
import ProfileInfo from '../../../components/customers/ProfileInfo';
import ProfileBilling from '../../../components/customers/ProfileBilling';

export default {
  props: {
    id: { type: String },
    defaultTab: { type: String, default: () => 'followUp' },
  },
  components: {
    ProfileHeader,
    ProfileTabs,
  },
  metaInfo: {
    title: 'Infos personnelles',
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Accompagnement',
          name: 'followUp',
          default: this.defaultTab === 'followUp',
          component: ProfileFollowUp,
        },
        {
          label: 'Infos',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
          notification: 'profiles',
        },
        {
          label: 'Facturation',
          name: 'billing',
          default: this.defaultTab === 'billing',
          component: ProfileBilling,
        },
      ],
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { customerId: this.id });
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications', 'customer');
    },
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .header-margin
    margin-bottom: 60px
    @media (max-width: 768px)
      margin-bottom: 40px
</style>
