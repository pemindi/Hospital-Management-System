import api from './api';

export const getInvoices = async (params = {}) => {
  const response = await api.get('/invoices', { params });
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post('/invoices', data);
  return response.data;
};

export const recordPayment = async (id, data) => {
  const response = await api.put(`/invoices/${id}/payment`, data);
  return response.data;
};