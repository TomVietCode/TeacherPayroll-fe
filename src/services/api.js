import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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
  getCourseClassesByTeacherAndSemester: (teacherId, semesterId) => api.get(`/course-classes/by-teacher/${teacherId}/semester/${semesterId}`),
  create: (data) => api.post('/course-classes', data),
  update: (id, data) => api.patch(`/course-classes/${id}`, data),
  delete: (id) => api.delete(`/course-classes/${id}`),
};

// Teacher Assignment API endpoints - Optimized UC2.4 Implementation
export const TeacherAssignmentAPI = {
  // Basic CRUD operations
  getAll: (params = {}) => api.get('/teacher-assignments', { params }),
  getById: (id) => api.get(`/teacher-assignments/${id}`),
  create: (data) => api.post('/teacher-assignments', data),
  update: (id, data) => api.patch(`/teacher-assignments/${id}`, data),
  delete: (id) => api.delete(`/teacher-assignments/${id}`),

  // Optimized assignment operations
  bulkAssignment: (data) => api.post('/teacher-assignments/bulk', data),
  quickAssignment: (data) => api.post('/teacher-assignments/quick', data),

  // Helper endpoints for quick assignment
  getUnassignedClasses: (params = {}) => api.get('/teacher-assignments/unassigned/classes', { params }),
  getTeacherWorkload: (teacherId, params = {}) => api.get(`/teacher-assignments/teacher/${teacherId}/workload`, { params }),

  // Statistics and analytics
  getAssignmentStats: (params = {}) => api.get('/teacher-assignments/stats', { params }),
};

// Statistics API endpoints
export const StatisticsAPI = {
  byDepartment: () => api.get('/statistics/by-department'),
  byDegree: () => api.get('/statistics/by-degree'),
  byAge: () => api.get('/statistics/by-age'),
  courseClasses: (academicYear) => api.get(`/statistics/course-classes/${academicYear}`),
  exportCourseClasses: (academicYear) => api.get(`/statistics/course-classes/${academicYear}/export`, { responseType: 'blob' }),
  getAcademicYears: () => api.get('/semesters/academic-years'),
};

// Hourly Rate API endpoints - UC3.1
export const HourlyRateAPI = {
  getAll: () => api.get('/hourly-rates'),
  getById: (id) => api.get(`/hourly-rates/${id}`),
  getByAcademicYear: (academicYear) => api.get(`/hourly-rates/academic-year/${academicYear}`),
  create: (data) => api.post('/hourly-rates', data),
  update: (id, data) => api.patch(`/hourly-rates/${id}`, data),
  delete: (id) => api.delete(`/hourly-rates/${id}`),
};

// Teacher Coefficient API endpoints - UC3.2
export const TeacherCoefficientAPI = {
  getAll: (params) => api.get('/teacher-coefficients', { params }),
  getByAcademicYear: (academicYear) => api.get(`/teacher-coefficients/academic-year/${academicYear}`),
  create: (data) => api.post('/teacher-coefficients', data),
  batchUpdate: (data) => api.patch('/teacher-coefficients/batch', data),
  update: (id, data) => api.patch(`/teacher-coefficients/${id}`, data),
  delete: (id) => api.delete(`/teacher-coefficients/${id}`),
};

// Class Coefficient API endpoints - UC3.3
export const ClassCoefficientAPI = {
  getAll: () => api.get('/class-coefficients'),
  getById: (id) => api.get(`/class-coefficients/${id}`),
  getByAcademicYear: (academicYear) => api.get(`/class-coefficients/academic-year/${academicYear}`),
  getValidStudentRanges: () => api.get('/class-coefficients/ranges'),
  create: (data) => api.post('/class-coefficients', data),
  update: (id, data) => api.patch(`/class-coefficients/${id}`, data),
  updateByAcademicYear: (academicYear, data) => api.patch(`/class-coefficients/academic-year/${academicYear}`, data),
  delete: (id) => api.delete(`/class-coefficients/${id}`),
};

// Payroll API endpoints - UC3.4
export const PayrollAPI = {
  calculate: (data) => api.post('/payroll/calculate', data),
  getValidAcademicYears: () => api.get('/payroll/academic-years'),
};

// Report API endpoints - UC4
export const ReportAPI = {
  // UC4.1: Báo cáo tiền dạy của giáo viên trong một năm
  getTeacherYearlyReport: (teacherId, academicYear) => api.get(`/reports/teacher/${teacherId}/yearly/${academicYear}`),
  
  // UC4.2: Báo cáo tiền dạy của giáo viên một khoa
  getDepartmentReport: (departmentId, academicYear, semesterId) => {
    const params = semesterId ? { semesterId } : {};
    return api.get(`/reports/department/${departmentId}/yearly/${academicYear}`, { params });
  },
  
  // UC4.3: Báo cáo tiền dạy của giáo viên toàn trường
  getSchoolReport: (academicYear, semesterId) => {
    const params = semesterId ? { semesterId } : {};
    return api.get(`/reports/school/yearly/${academicYear}`, { params });
  },
  
  // Excel export endpoints
  exportTeacherYearlyReport: (teacherId, academicYear) => 
    api.get(`/reports/teacher/${teacherId}/yearly/${academicYear}/export`, { responseType: 'blob' }),
  exportDepartmentReport: (departmentId, academicYear, semesterId) => {
    const params = semesterId ? { semesterId } : {};
    return api.get(`/reports/department/${departmentId}/yearly/${academicYear}/export`, { 
      params, 
      responseType: 'blob' 
    });
  },
  exportSchoolReport: (academicYear, semesterId) => {
    const params = semesterId ? { semesterId } : {};
    return api.get(`/reports/school/yearly/${academicYear}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
};

export default api;
