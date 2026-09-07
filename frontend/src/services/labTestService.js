import api from './api';

export const getLabTests = async (params = {}) => {
  const response = await api.get('/lab-tests', { params });
  return response.data;
};

export const getLabTestById = async (id) => {
  const response = await api.get(`/lab-tests/${id}`);
  return response.data;
};

export const getLabTestsByPatient = async (patientId) => {
  const response = await api.get(`/lab-tests/patient/${patientId}`);
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

// Sends multipart/form-data since files may be attached
export const enterResult = async (id, resultText, files = []) => {
  const formData = new FormData();
  formData.append('resultText', resultText);
  files.forEach((file) => formData.append('attachments', file));

  const response = await api.put(`/lab-tests/${id}/result`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removeAttachment = async (id, attachmentIndex) => {
  const response = await api.delete(`/lab-tests/${id}/attachments/${attachmentIndex}`);
  return response.data;
};