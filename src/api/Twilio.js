import axios from 'axios'
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async sendSMS (phoneNbr, data) {
    const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/send/${phoneNbr}`, data);
    return res;
  },
  async sendSMSWarning (params, token = null) {
    let res;
    if (token === null) {
      res = await alenviAxios.post(`${process.env.API_HOSTNAME}/twilio/sendWarning/${params.phoneNbr}`, params);
    } else {
      res = await axios.post(`${process.env.API_HOSTNAME}/twilio/sendWarning/${params.phoneNbr}`, params, { headers: { 'x-access-token': token } });
    }
    return res;
  },
  async getRecords (params, token) {
    const res = await alenviAxios.get(`${process.env.API_HOSTNAME}/twilio/records`, { params });
    return res;
  }
}
