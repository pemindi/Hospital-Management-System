import api from './api';

const getReport = async (type, params = {}) => {
  const response = await api.get(`/reports/${type}`, { params });
  return response.data;
};

export const getPatientReport = (params) => getReport('patients', params);
export const getAppointmentReport = (params) => getReport('appointments', params);
export const getRevenueReport = (params) => getReport('revenue', params);
export const getPharmacyReport = (params) => getReport('pharmacy', params);
export const getLaboratoryReport = (params) => getReport('laboratory', params);
export const getStaffReport = (params) => getReport('staff', params);
export const getDashboardSummary = (params) => getReport('dashboard-summary', params);