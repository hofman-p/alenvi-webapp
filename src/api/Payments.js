import { alenviAxios } from './ressources/alenviAxios'

export default {
  async list (params) {
    const payments = await alenviAxios.get(`${process.env.API_HOSTNAME}/payments`, { params });
    return payments.data.data.payments;
  },
  async create (data) {
    const payment = await alenviAxios.post(`${process.env.API_HOSTNAME}/payments`, data);
    return payment.data.data.payment;
  },
}
