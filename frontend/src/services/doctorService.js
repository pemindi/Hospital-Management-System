import api from './api';

export const getDoctors = async (params = {}) => {
  const response = await api.get('/doctors', { params });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const createDoctor = async (data) => {
  const response = await api.post('/doctors', data);
  return response.data;
};

export const updateDoctor = async (id, data) => {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id) => {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
};