import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RouteGuard from './components/auth/RouteGuard';
import LoginPage from './pages/auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';

// Các trang quản lý
import DegreesPage from './pages/degrees/DegreesPage';
import DepartmentsPage from './pages/departments/DepartmentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import SubjectsPage from './pages/subjects/SubjectsPage';
import SemestersPage from './pages/semesters/SemestersPage';
import CourseClassesPage from './pages/courseClasses/CourseClassesPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import CourseClassStatistics from './pages/courseClasses/CourseClassStatistics';

// Teacher Assignment Pages
import TeacherAssignmentList from './pages/teacherAssignments/TeacherAssignmentList';
import AssignmentForm from './pages/teacherAssignments/AssignmentForm';

// Payroll Pages - UC3
import HourlyRatesPage from './pages/hourlyRates/HourlyRatesPage';
import TeacherCoefficientsPage from './pages/teacherCoefficients/TeacherCoefficientsPage';
import ClassCoefficientsPage from './pages/classCoefficients/ClassCoefficientsPage';
import PayrollCalculationPage from './pages/payrollCalculation/PayrollCalculationPage';

// Report Pages - UC4
import TeacherYearlyReportPage from './pages/reports/TeacherYearlyReportPage';
import DepartmentReportPage from './pages/reports/DepartmentReportPage';
import SchoolReportPage from './pages/reports/SchoolReportPage';

// Profile Page
import ProfilePage from './pages/profile/ProfilePage';

// Import CSS
import './App.css';

// Import font Roboto
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Protected routes wrapped with ProtectedRoute and RouteGuard
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <StatisticsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/degrees',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <DegreesPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/departments',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <DepartmentsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teachers',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <TeachersPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <SubjectsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/semesters',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <SemestersPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/course-classes',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <CourseClassesPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/statistics',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <StatisticsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  // Course Class Statistics Route
  {
    path: '/course-class-statistics',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <CourseClassStatistics />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  // Teacher Assignment Routes
  {
    path: '/teacher-assignments',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <TeacherAssignmentList />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher-assignments/new',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <AssignmentForm />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher-assignments/edit/:id',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <AssignmentForm />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  // Payroll Management Routes - UC3
  {
    path: '/hourly-rates',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <HourlyRatesPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher-coefficients',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <TeacherCoefficientsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/class-coefficients',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <ClassCoefficientsPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/payroll-calculation',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <PayrollCalculationPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  // Report Routes - UC4
  {
    path: '/reports/teacher-yearly',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <TeacherYearlyReportPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/department',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <DepartmentReportPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/school',
    element: (
      <ProtectedRoute>
        <RouteGuard>
          <MainLayout>
            <SchoolReportPage />
          </MainLayout>
        </RouteGuard>
      </ProtectedRoute>
    ),
  },
]);

// Main App component with authentication logic
function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
