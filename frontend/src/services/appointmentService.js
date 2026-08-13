import api from './api';

export const getAppointments = async (params = {}) => {
  const response = await api.get('/appointments', { params });
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const rescheduleAppointment = async (id, data) => {
  const response = await api.put(`/appointments/${id}/reschedule`, data);
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.put(`/appointments/${id}/status`, { status });
  return response.data;
};