import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDraftBills (params = null) {
    const draftBills = await alenviAxios.get(`${process.env.API_HOSTNAME}/bills/drafts`, { params });
    return draftBills.data.data.draftBills;
  },
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/bills`, data);
  },
  async showAll (params = null) {
    const bills = await alenviAxios.get(`${process.env.API_HOSTNAME}/bills`, { params });
    return bills.data.data.bills;
  },
  async getPDF (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/bills/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { 'Accept': 'application/pdf' } }
    );
  },
}
