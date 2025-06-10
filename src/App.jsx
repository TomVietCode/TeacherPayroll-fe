import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
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

// Import CSS
import './App.css';

// Import font Roboto
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <StatisticsPage />
      </MainLayout>
    ),
  },
  {
    path: '/degrees',
    element: (
      <MainLayout>
        <DegreesPage />
      </MainLayout>
    ),
  },
  {
    path: '/departments',
    element: (
      <MainLayout>
        <DepartmentsPage />
      </MainLayout>
    ),
  },
  {
    path: '/teachers',
    element: (
      <MainLayout>
        <TeachersPage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects',
    element: (
      <MainLayout>
        <SubjectsPage />
      </MainLayout>
    ),
  },
  {
    path: '/semesters',
    element: (
      <MainLayout>
        <SemestersPage />
      </MainLayout>
    ),
  },
  {
    path: '/course-classes',
    element: (
      <MainLayout>
        <CourseClassesPage />
      </MainLayout>
    ),
  },
  {
    path: '/statistics',
    element: (
      <MainLayout>
        <StatisticsPage />
      </MainLayout>
    ),
  },
  // Course Class Statistics Route
  {
    path: '/course-class-statistics',
    element: (
      <MainLayout>
        <CourseClassStatistics />
      </MainLayout>
    ),
  },
  // Teacher Assignment Routes
  {
    path: '/teacher-assignments',
    element: (
      <MainLayout>
        <TeacherAssignmentList />
      </MainLayout>
    ),
  },
  {
    path: '/teacher-assignments/new',
    element: (
      <MainLayout>
        <AssignmentForm />
      </MainLayout>
    ),
  },
  {
    path: '/teacher-assignments/edit/:id',
    element: (
      <MainLayout>
        <AssignmentForm />
      </MainLayout>
    ),
  },
  // Payroll Management Routes - UC3
  {
    path: '/hourly-rates',
    element: (
      <MainLayout>
        <HourlyRatesPage />
      </MainLayout>
    ),
  },
  {
    path: '/teacher-coefficients',
    element: (
      <MainLayout>
        <TeacherCoefficientsPage />
      </MainLayout>
    ),
  },
  {
    path: '/class-coefficients',
    element: (
      <MainLayout>
        <ClassCoefficientsPage />
      </MainLayout>
    ),
  },
  {
    path: '/payroll-calculation',
    element: (
      <MainLayout>
        <PayrollCalculationPage />
      </MainLayout>
    ),
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
