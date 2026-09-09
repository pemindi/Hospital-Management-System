import api from './api';

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot', data);
  return response.data;
};

export const resetPassword = async (token, data) => {
  const response = await api.post(`/auth/reset/${token}`, data);
  return response.data;
};
