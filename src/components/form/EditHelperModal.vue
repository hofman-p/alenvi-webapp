<template>
  <ni-modal :value="openEditedHelperModal" @hide="hide">
    <template slot="title">
      Modifier l'<span class="text-weight-bold">aidant</span>
    </template>
    <ni-input in-modal v-model="editedHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="editedHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal v-model.trim="editedHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" :error-label="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Modifier l'aidant" icon-right="add" color="primary"
        :loading="loading" @click="editHelper" />
    </template>
  </ni-modal>
</template>

<script>

import Modal from '../Modal';
import Input from '../form/Input';

export default {
  name: 'EditHelperModal',
  props: {
    openEditedHelperModal: { type: Boolean, default: false },
    editedHelper: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  computed: {
    phoneNbrError () {
      if (!this.$_.get(this.validations, 'contact.phone.frPhoneNumber', null)) {
        return 'Numéro de téléphone non valide';
      }
    },
  },
  methods: {
    editHelper () {
      this.$emit('editHelper');
    },
    hide () {
      this.$emit('hide');
    },
  },
}
</script>
