// Role-based permission utility functions
// Based on AUTHORIZATION_MATRIX.md

export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY_MANAGER: 'FACULTY_MANAGER', 
  ACCOUNTANT: 'ACCOUNTANT',
  TEACHER: 'TEACHER'
};

// Check if user has permission for specific features
export const hasPermission = (userRole, feature) => {
  if (!userRole) return false;

  const permissions = {
    // Basic data management
    MANAGE_DEGREES: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    MANAGE_DEPARTMENTS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    MANAGE_SUBJECTS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    MANAGE_SEMESTERS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    
    // Teacher management
    MANAGE_TEACHERS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    VIEW_TEACHER_STATISTICS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT],
    
    // Class and assignment management
    MANAGE_COURSE_CLASSES: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    MANAGE_TEACHER_ASSIGNMENTS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    VIEW_CLASS_STATISTICS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT],
    
    // Coefficients and rates management
    MANAGE_HOURLY_RATES: [ROLES.ADMIN],
    UPDATE_HOURLY_RATES: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    MANAGE_TEACHER_COEFFICIENTS: [ROLES.ADMIN],
    UPDATE_TEACHER_COEFFICIENTS: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    MANAGE_CLASS_COEFFICIENTS: [ROLES.ADMIN],
    UPDATE_CLASS_COEFFICIENTS: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    
    // Payroll calculation
    CALCULATE_PAYROLL: [ROLES.ADMIN, ROLES.ACCOUNTANT],
    VIEW_ALL_PAYROLL: [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT],
    VIEW_OWN_PAYROLL: [ROLES.TEACHER],
    
    // Reports
    VIEW_ALL_REPORTS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT],
    VIEW_OWN_REPORTS: [ROLES.TEACHER],
    EXPORT_REPORTS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT],
    EXPORT_OWN_REPORTS: [ROLES.TEACHER],
    
    // CRUD operations
    CREATE_OPERATIONS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    UPDATE_OPERATIONS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER],
    DELETE_OPERATIONS: [ROLES.ADMIN, ROLES.FACULTY_MANAGER]
  };

  return permissions[feature]?.includes(userRole) || false;
};

// Check if user can access specific pages
export const canAccessPage = (userRole, page) => {
  if (!userRole) return false;

  // Pages accessible to teachers (restricted list)
  const teacherPages = [
    '/profile',
    '/course-classes', // Can view only assigned classes
    '/teacher-assignments', // Can view only own assignments
    '/payroll-calculation', // Can view only own salary
    '/reports/teacher-yearly' // Can view only own reports
  ];

  // If user is teacher, only allow access to specific pages (excluding statistics)
  if (userRole === ROLES.TEACHER) {
    return teacherPages.includes(page);
  }

  // Admin can access everything
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  // Faculty Manager can access most things except financial management
  if (userRole === ROLES.FACULTY_MANAGER) {
    const restrictedPages = [
      '/hourly-rates',
      '/teacher-coefficients', 
      '/class-coefficients'
    ];
    return !restrictedPages.includes(page);
  }

  // Accountant can access financial and reporting features
  if (userRole === ROLES.ACCOUNTANT) {
    const allowedPages = [
      '/',
      '/statistics',
      '/profile',
      '/hourly-rates',
      '/teacher-coefficients',
      '/class-coefficients', 
      '/payroll-calculation',
      '/reports/teacher-yearly',
      '/reports/department',
      '/reports/school'
    ];
    return allowedPages.includes(page);
  }

  return false;
};

// Check if user can perform CRUD operations
export const canCreate = (userRole) => hasPermission(userRole, 'CREATE_OPERATIONS');
export const canUpdate = (userRole) => hasPermission(userRole, 'UPDATE_OPERATIONS');
export const canDelete = (userRole) => hasPermission(userRole, 'DELETE_OPERATIONS');

// Check if user can manage specific entities
export const canManageTeachers = (userRole) => hasPermission(userRole, 'MANAGE_TEACHERS');
export const canManageCourseClasses = (userRole) => hasPermission(userRole, 'MANAGE_COURSE_CLASSES');
export const canManageAssignments = (userRole) => hasPermission(userRole, 'MANAGE_TEACHER_ASSIGNMENTS');

// Check if user can view all data or only own data
export const canViewAllData = (userRole) => {
  return [ROLES.ADMIN, ROLES.FACULTY_MANAGER, ROLES.ACCOUNTANT].includes(userRole);
};

export const canViewOwnDataOnly = (userRole) => {
  return userRole === ROLES.TEACHER;
};

// Get menu items based on user role
export const getMenuItems = (userRole) => {
  if (!userRole) return [];

  // Teacher menu - restricted
  if (userRole === ROLES.TEACHER) {
    return [
      {
        section: 'personal',
        title: 'Thông tin cá nhân',
        items: [
          { text: 'Lớp học phần', icon: 'GroupWorkIcon', path: '/course-classes' },
          { text: 'Phân công giảng dạy', icon: 'AssignmentIcon', path: '/teacher-assignments' }
        ]
      },
      {
        section: 'salary',
        title: 'Tiền dạy',
        items: [
          { text: 'Tính tiền dạy', icon: 'CalculateIcon', path: '/payroll-calculation' },
          { text: 'Báo cáo cá nhân', icon: 'PersonIcon', path: '/reports/teacher-yearly' }
        ]
      }
    ];
  }

  // Full menu for admin, faculty manager, accountant
  const fullMenu = [
    {
      section: 'teacher_management',
      title: 'Quản lý giáo viên',
      items: [
        { text: 'Thống kê', icon: 'EqualizerIcon', path: '/' },
        { text: 'Bằng cấp', icon: 'SchoolIcon', path: '/degrees' },
        { text: 'Khoa', icon: 'DomainIcon', path: '/departments' },
        { text: 'Giáo viên', icon: 'PeopleIcon', path: '/teachers' }
      ]
    },
    {
      section: 'class_management',
      title: 'Quản lý lớp học phần',
      items: [
        { text: 'Học phần', icon: 'BookIcon', path: '/subjects' },
        { text: 'Kỳ học', icon: 'CalendarTodayIcon', path: '/semesters' },
        { text: 'Lớp học phần', icon: 'GroupWorkIcon', path: '/course-classes' },
        { text: 'Phân công giáo viên', icon: 'AssignmentIcon', path: '/teacher-assignments' },
        { text: 'Thống kê lớp học phần', icon: 'EqualizerIcon', path: '/course-class-statistics' }
      ]
    },
    {
      section: 'payroll_management',
      title: 'Tính tiền dạy',
      items: [
        { text: 'Định mức tiền theo tiết', icon: 'AttachMoneyIcon', path: '/hourly-rates' },
        { text: 'Hệ số giáo viên', icon: 'TrendingUpIcon', path: '/teacher-coefficients' },
        { text: 'Hệ số lớp', icon: 'SettingsIcon', path: '/class-coefficients' },
        { text: 'Tính tiền dạy', icon: 'CalculateIcon', path: '/payroll-calculation' }
      ]
    },
    {
      section: 'reports',
      title: 'Báo cáo tiền dạy',
      items: [
        { text: 'Báo cáo giáo viên theo năm', icon: 'PersonIcon', path: '/reports/teacher-yearly' },
        { text: 'Báo cáo theo khoa', icon: 'DomainIcon', path: '/reports/department' },
        { text: 'Báo cáo toàn trường', icon: 'SchoolIcon', path: '/reports/school' }
      ]
    }
  ];

  // Filter menu based on role
  if (userRole === ROLES.ACCOUNTANT) {
    // Accountant can't manage basic data (teachers, departments, etc.)
    return fullMenu.filter(section => 
      section.section !== 'teacher_management' || section.section === 'teacher_management' && section.items.length === 1
    ).map(section => {
      if (section.section === 'teacher_management') {
        return {
          ...section,
          items: section.items.filter(item => item.path === '/')
        };
      }
      return section;
    });
  }

  if (userRole === ROLES.FACULTY_MANAGER) {
    // Faculty Manager can't manage financial coefficients and rates
    return fullMenu.map(section => {
      if (section.section === 'payroll_management') {
        return {
          ...section,
          items: section.items.filter(item => item.path === '/payroll-calculation')
        };
      }
      return section;
    });
  }

  // Admin gets full menu
  return fullMenu;
}; 