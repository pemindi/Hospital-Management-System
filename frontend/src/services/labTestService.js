import api from './api';

export const getLabTests = async (params = {}) => {
  const response = await api.get('/lab-tests', { params });
  return response.data;
};

export const getLabTestById = async (id) => {
  const response = await api.get(`/lab-tests/${id}`);
  return response.data;
};

export const createLabTest = async (data) => {
  const response = await api.post('/lab-tests', data);
  return response.data;
};

export const collectSample = async (id) => {
  const response = await api.put(`/lab-tests/${id}/collect-sample`);
  return response.data;
};

export const enterResult = async (id, resultText) => {
  const response = await api.put(`/lab-tests/${id}/result`, { resultText });
  return response.data;
};