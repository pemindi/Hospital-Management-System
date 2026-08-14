import api from './api';

export const createMedicalRecord = async (data) => {
  const response = await api.post('/medical-records', data);
  return response.data;
};

export const getRecordsByPatient = async (patientId) => {
  const response = await api.get(`/medical-records/patient/${patientId}`);
  return response.data;
};

export const getRecordById = async (id) => {
  const response = await api.get(`/medical-records/${id}`);
  return response.data;
};

export const updateMedicalRecord = async (id, data) => {
  const response = await api.put(`/medical-records/${id}`, data);
  return response.data;
};