import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${data._id}`, data);
    return companyRaw.data.data;
  },
  async getServices (id) {
    const services = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/services`);
    return services.data.data.services;
  },
  async createService (id, payload) {
    const services = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/services`, payload);
    return services.data.data.services;
  },
  async updateService (params, payload) {
    const services = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/services/${params.serviceId}`, payload);
    return services.data.data.services;
  },
  async deleteService (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/services/${queries.serviceId}`);
  },
  async createInternalHour (id, payload) {
    const internalHours = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`, payload);
    return internalHours.data.data.internalHours;
  },
  async getInternalHours (id) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`);
    return internalHours.data.data.internalHours;
  },
  async updateInternalHour (params, payload) {
    const internalHours = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/internalHours/${params.internalHourId}`, payload);
    return internalHours.data.data.internalHours;
  },
  async deleteInternalHour (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/internalHours/${queries.internalHourId}`);
  },
  async createThirdPartyPayer (id, data) {
    const newThirdPartyPayer = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/thirdpartypayers`, data);
    return newThirdPartyPayer.data.data.thirdPartyPayers;
  },
  async deleteThirdPartyPayer (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/thirdpartypayers/${queries.thirdPartyPayerId}`);
  },
  async updateThirdPartyPayer (params, payload) {
    const thirdPartyPayer = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/thirdpartypayers/${params.thirdPartyPayerId}`, payload);
    return thirdPartyPayer.data.data.thirdPartyPayers;
  },
  async createSector (id, payload) {
    const sectors = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/sectors`, payload);
    return sectors.data.data.sectors;
  },
  async getSectors (id) {
    const sectors = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/sectors`);
    return sectors.data.data.sectors;
  },
  async updateSector (params, payload) {
    const sector = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/sectors/${params.sectorId}`, payload);
    return sector.data.data.sector;
  },
  async deleteSector (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/sectors/${queries.sectorId}`);
  }

}
