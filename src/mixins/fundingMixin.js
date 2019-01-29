import { days } from '../data/days';
import { FUNDING_FREQ_OPTIONS, FUNDING_NATURE_OPTIONS } from '../data/constants.js';

export const fundingMixin = {
  data () {
    return {
      fundings: [],
      selectedFunding: {},
      fundingColumns: [
        {
          name: 'start',
          label: 'Date de début de prise en charge',
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
          field: 'startDate',
        },
        {
          name: 'thirdPartyPayer',
          label: 'Tiers payeur',
          align: 'left',
          field: 'thirdPartyPayer',
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = FUNDING_NATURE_OPTIONS.find(option => option.value === value);
            return nature ? this.$_.capitalize(nature.label) : ''
          },
          field: 'nature',
        },
        {
          name: 'folderNumber',
          label: 'Numéro de dossier',
          align: 'left',
          field: 'folderNumber',
        },
        {
          name: 'end',
          label: 'Date de fin de prise en charge',
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
          field: 'endDate',
        },
        {
          name: 'frequency',
          label: 'Fréquence',
          align: 'left',
          format: (value) => this.frequencyFormat(value),
          field: 'frequency',
        },
        {
          name: 'amountTTC',
          label: 'Montant forfaitaire TTC',
          align: 'left',
          format: (value) => value ? `${value}€` : '',
          field: 'amountTTC'
        },
        {
          name: 'unitTTCPrice',
          label: 'Prix unitaire TTC',
          align: 'left',
          format: (value) => value ? `${value}€` : '',
          field: 'unitTTCPrice',
        },
        {
          name: 'careHours',
          label: 'Heures de prise en charge',
          align: 'left',
          format: (value) => value ? `${value}h` : '',
          field: 'careHours',
        },
        {
          name: 'customerParticipationRate',
          label: 'Tx. participation bénéficiaire',
          align: 'left',
          format: (value) => value ? `${value}%` : '0%',
          field: 'customerParticipationRate',
        },
        {
          name: 'careDays',
          label: 'Jours de prise en charge',
          align: 'left',
          format: (value) => value && value.length > 0 ? value.map(day => days[day]).join(', ') : '',
          field: 'careDays',
        },
        {
          name: 'services',
          label: 'Souscriptions',
          align: 'left',
          format: (value) => value && value.length > 0 ? value.map(sub => sub.name).join(', ') : '',
          field: 'services',
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        }
      ]
    }
  },
  methods: {
    refreshFundings () {
      try {
        this.fundings = this.customer.fundings.map(fund => ({
          ...this.getFundingLastVersion(fund),
          ...fund,
        }))

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    getFundingLastVersion (funding) {
      if (!funding.versions || funding.versions.length === 0) return {};

      return funding.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
    },
    careDaysFormat (value) {
      if (value && value.length > 0) {
        let daysArr = [...value];
        daysArr = daysArr.sort((a, b) => a - b);
        return daysArr.map(day => days[day]).join(', ');
      }
      return '';
    },
    frequencyFormat (value) {
      const freq = FUNDING_FREQ_OPTIONS.find(option => option.value === value);
      return freq ? this.$_.capitalize(freq.label) : ''
    }
  }
};