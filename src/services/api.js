import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Degree API endpoints
export const DegreeAPI = {
  getAll: () => api.get('/degrees'),
  getById: (id) => api.get(`/degrees/${id}`),
  create: (data) => api.post('/degrees', data),
  update: (id, data) => api.patch(`/degrees/${id}`, data),
  delete: (id) => api.delete(`/degrees/${id}`),
};

// Department API endpoints
export const DepartmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.patch(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Teacher API endpoints
export const TeacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.patch(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// Subject API endpoints
export const SubjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.patch(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Semester API endpoints
export const SemesterAPI = {
  getAll: () => api.get('/semesters'),
  getById: (id) => api.get(`/semesters/${id}`),
  create: (data) => api.post('/semesters', data),
  update: (id, data) => api.patch(`/semesters/${id}`, data),
  delete: (id) => api.delete(`/semesters/${id}`),
};

// CourseClass API endpoints
export const CourseClassAPI = {
  getAll: (params) => api.get('/course-classes', { params }),
  getById: (id) => api.get(`/course-classes/${id}`),
  getBySemester: (semesterId) => api.get(`/course-classes/by-semester/${semesterId}`),
  create: (data) => api.post('/course-classes', data),
  update: (id, data) => api.patch(`/course-classes/${id}`, data),
  delete: (id) => api.delete(`/course-classes/${id}`),
};

// Statistics API endpoints
export const StatisticsAPI = {
  byDepartment: () => api.get('/statistics/by-department'),
  byDegree: () => api.get('/statistics/by-degree'),
  byAge: () => api.get('/statistics/by-age'),
};

export default api;
