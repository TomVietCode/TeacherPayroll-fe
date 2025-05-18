import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import theme from './theme/theme';

// Trang chủ
import HomePage from './pages/home/HomePage';

// Các trang quản lý
import DegreesPage from './pages/degrees/DegreesPage';
import DepartmentsPage from './pages/departments/DepartmentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import StatisticsPage from './pages/statistics/StatisticsPage';

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
        <HomePage />
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
    path: '/statistics',
    element: (
      <MainLayout>
        <StatisticsPage />
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
