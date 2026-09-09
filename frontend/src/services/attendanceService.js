import api from './api';

export const markAttendance = async (data) => {
  const response = await api.post('/attendance', data);
  return response.data;
};

export const getAttendanceByDate = async (date) => {
  const response = await api.get('/attendance', { params: { date } });
  return response.data;
};

export const getAttendanceByEmployee = async (employeeId) => {
  const response = await api.get(`/attendance/employee/${employeeId}`);
  return response.data;
};