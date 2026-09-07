import api from './api';

export const dispenseMedicine = async (data) => {
  const response = await api.post('/dispense', data);
  return response.data;
};

export const getDispenseHistory = async (params = {}) => {
  const response = await api.get('/dispense', { params });
  return response.data;
};