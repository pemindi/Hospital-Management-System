import api from './api';

export const applyLeave = async (data) => {
  const response = await api.post('/leaves', data);
  return response.data;
};

export const getLeaves = async (params = {}) => {
  const response = await api.get('/leaves', { params });
  return response.data;
};

export const updateLeaveStatus = async (id, status) => {
  const response = await api.put(`/leaves/${id}/status`, { status });
  return response.data;
};