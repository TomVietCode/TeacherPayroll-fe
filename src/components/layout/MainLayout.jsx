import { useState } from 'react';
import { 
  Toolbar, Typography, Box, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  ListItemButton, Divider, Container, useMediaQuery,
  Collapse, Breadcrumbs, Link as MuiLink
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import DomainIcon from '@mui/icons-material/Domain';
import PersonIcon from '@mui/icons-material/Person';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthenticatedHeader from './AuthenticatedHeader';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessPage, ROLES } from '../../utils/permissions';

// Helper function to get section name from path
const getSectionName = (path) => {
  if (path === '/' || path === '/statistics') return 'Thống kê';
  if (path === '/profile') return 'Thông tin cá nhân';
  if (path.includes('degrees')) return 'Bằng cấp';
  if (path.includes('departments')) return 'Khoa';
  if (path.includes('teachers') && !path.includes('teacher-assignments')) return 'Giáo viên';
  if (path.includes('subjects')) return 'Học phần';
  if (path.includes('semesters')) return 'Kỳ học';
  if (path.includes('course-classes')) return 'Lớp học phần';
  if (path.includes('teacher-assignments')) return 'Phân công giáo viên';
  if (path.includes('hourly-rates')) return 'Định mức tiền theo tiết';
  if (path.includes('teacher-coefficients')) return 'Hệ số giáo viên';
  if (path.includes('class-coefficients')) return 'Hệ số lớp';
  if (path.includes('payroll-calculation')) return 'Tính tiền dạy';
  if (path.includes('reports/teacher-yearly')) return 'Báo cáo giáo viên theo năm';
  if (path.includes('reports/department')) return 'Báo cáo theo khoa';
  if (path.includes('reports/school')) return 'Báo cáo toàn trường';
  return '';
};

// Full drawer width and mini drawer width when collapsed
const drawerWidth = 240;
const miniDrawerWidth = 64;

function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(true);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [payrollMenuOpen, setPayrollMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTeacherMenuToggle = () => {
    if (sidebarOpen) {
      if (teacherMenuOpen) {
        setTeacherMenuOpen(false);
      } else {
        setClassMenuOpen(false);
        setPayrollMenuOpen(false);
        setReportMenuOpen(false);
        setTeacherMenuOpen(true);
      }
    } else {
      setSidebarOpen(true);
      setClassMenuOpen(false);
      setPayrollMenuOpen(false);
      setReportMenuOpen(false);
      setTeacherMenuOpen(true);
    }
  };

  const handleClassMenuToggle = () => {
    if (sidebarOpen) {
      if (classMenuOpen) {
        setClassMenuOpen(false);
      } else {
        setTeacherMenuOpen(false);
        setPayrollMenuOpen(false);
        setReportMenuOpen(false);
        setClassMenuOpen(true);
      }
    } else {
      setSidebarOpen(true);
      setTeacherMenuOpen(false);
      setPayrollMenuOpen(false);
      setReportMenuOpen(false);
      setClassMenuOpen(true);
    }
  };

  const handlePayrollMenuToggle = () => {
    if (sidebarOpen) {
      if (payrollMenuOpen) {
        setPayrollMenuOpen(false);
      } else {
        setTeacherMenuOpen(false);
        setClassMenuOpen(false);
        setReportMenuOpen(false);
        setPayrollMenuOpen(true);
      }
    } else {
      setSidebarOpen(true);
      setTeacherMenuOpen(false);
      setClassMenuOpen(false);
      setReportMenuOpen(false);
      setPayrollMenuOpen(true);
    }
  };

  const handleReportMenuToggle = () => {
    if (sidebarOpen) {
      if (reportMenuOpen) {
        setReportMenuOpen(false);
      } else {
        setTeacherMenuOpen(false);
        setClassMenuOpen(false);
        setPayrollMenuOpen(false);
        setReportMenuOpen(true);
      }
    } else {
      setSidebarOpen(true);
      setTeacherMenuOpen(false);
      setClassMenuOpen(false);
      setPayrollMenuOpen(false);
      setReportMenuOpen(true);
    }
  };

  // Role-based menu configuration
  const getMenuConfig = () => {
    const userRole = user?.role;

    if (userRole === ROLES.TEACHER) {
      // Teacher menu - simplified
      return {
        sections: [
          {
            title: 'Thông tin cá nhân',
            icon: <PeopleIcon />,
            items: [
              { text: 'Thống kê', icon: <EqualizerIcon />, path: '/' },
              { text: 'Lớp học phần', icon: <GroupWorkIcon />, path: '/course-classes' },
              { text: 'Phân công giảng dạy', icon: <AssignmentIcon />, path: '/teacher-assignments' }
            ]
          },
          {
            title: 'Tiền dạy',
            icon: <AccountBalanceWalletIcon />,
            items: [
              { text: 'Tính tiền dạy', icon: <CalculateIcon />, path: '/payroll-calculation' },
              { text: 'Báo cáo cá nhân', icon: <PersonIcon />, path: '/reports/teacher-yearly' }
            ]
          }
        ]
      };
    }

    // Default menu for admin, faculty manager, accountant
    const fullSections = [
      {
        title: 'Quản lý giáo viên',
        icon: <PeopleIcon />,
        items: [
          { text: 'Thống kê', icon: <EqualizerIcon />, path: '/' },
          { text: 'Bằng cấp', icon: <SchoolIcon />, path: '/degrees' },
          { text: 'Khoa', icon: <DomainIcon />, path: '/departments' },
          { text: 'Giáo viên', icon: <PeopleIcon />, path: '/teachers' }
        ]
      },
      {
        title: 'Quản lý lớp học phần',
        icon: <ClassIcon />,
        items: [
          { text: 'Học phần', icon: <BookIcon />, path: '/subjects' },
          { text: 'Kỳ học', icon: <CalendarTodayIcon />, path: '/semesters' },
          { text: 'Lớp học phần', icon: <GroupWorkIcon />, path: '/course-classes' },
          { text: 'Phân công giáo viên', icon: <AssignmentIcon />, path: '/teacher-assignments' },
          { text: 'Thống kê lớp học phần', icon: <EqualizerIcon />, path: '/course-class-statistics' }
        ]
      },
      {
        title: 'Tính tiền dạy',
        icon: <AccountBalanceWalletIcon />,
        items: [
          { text: 'Định mức tiền theo tiết', icon: <AttachMoneyIcon />, path: '/hourly-rates' },
          { text: 'Hệ số giáo viên', icon: <TrendingUpIcon />, path: '/teacher-coefficients' },
          { text: 'Hệ số lớp', icon: <SettingsIcon />, path: '/class-coefficients' },
          { text: 'Tính tiền dạy', icon: <CalculateIcon />, path: '/payroll-calculation' }
        ]
      },
      {
        title: 'Báo cáo tiền dạy',
        icon: <AssessmentIcon />,
        items: [
          { text: 'Báo cáo giáo viên theo năm', icon: <PersonIcon />, path: '/reports/teacher-yearly' },
          { text: 'Báo cáo theo khoa', icon: <DomainIcon />, path: '/reports/department' },
          { text: 'Báo cáo toàn trường', icon: <SchoolIcon />, path: '/reports/school' }
        ]
      }
    ];

    // Filter based on role
    if (userRole === ROLES.ACCOUNTANT) {
      return {
        sections: [
          {
            ...fullSections[0],
            items: fullSections[0].items.filter(item => item.path === '/')
          },
          fullSections[2], // Payroll management
          fullSections[3]  // Reports
        ]
      };
    }

    if (userRole === ROLES.FACULTY_MANAGER) {
      return {
        sections: [
          fullSections[0], // Teacher management
          fullSections[1], // Class management
          {
            ...fullSections[2],
            items: fullSections[2].items.filter(item => item.path === '/payroll-calculation')
          },
          fullSections[3]  // Reports
        ]
      };
    }

    // Admin gets full menu
    return { sections: fullSections };
  };

  const menuConfig = getMenuConfig();
  
  const drawer = (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {sidebarOpen && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, pl: 1 }}>
            {user?.role === ROLES.TEACHER ? 'Giáo viên' : 'Quản lý tiền dạy'}
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuConfig.sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => {
                  // Handle section toggle based on index
                  if (sectionIndex === 0) handleTeacherMenuToggle();
                  else if (sectionIndex === 1) handleClassMenuToggle();
                  else if (sectionIndex === 2) handlePayrollMenuToggle();
                  else if (sectionIndex === 3) handleReportMenuToggle();
                }}
                sx={{ 
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: sidebarOpen ? 2.5 : 'auto',
                  minHeight: 48,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {section.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <>
                    <ListItemText primary={section.title} />
                    {(sectionIndex === 0 && teacherMenuOpen) ||
                     (sectionIndex === 1 && classMenuOpen) ||
                     (sectionIndex === 2 && payrollMenuOpen) ||
                     (sectionIndex === 3 && reportMenuOpen) ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={sidebarOpen && (
              (sectionIndex === 0 && teacherMenuOpen) ||
              (sectionIndex === 1 && classMenuOpen) ||
              (sectionIndex === 2 && payrollMenuOpen) ||
              (sectionIndex === 3 && reportMenuOpen)
            )} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.items.filter(item => canAccessPage(user?.role, item.path)).map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton 
                      selected={location.pathname === item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) {
                          setSidebarOpen(false);
                        }
                      }}
                      sx={{ 
                        pl: 4,
                        minHeight: 40,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </div>
  );
  
  // Calculate the width of main content based on sidebar state
  const contentWidth = sidebarOpen 
    ? { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } 
    : { xs: '100%', md: `calc(100% - ${miniDrawerWidth}px)` };
  
  // Calculate the left margin of main content based on sidebar state
  const contentMargin = sidebarOpen 
    ? { xs: 0, md: `${drawerWidth}px` } 
    : { xs: 0, md: `${miniDrawerWidth}px` };

  const sectionName = getSectionName(location.pathname);
  
  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <AuthenticatedHeader 
        onMenuToggle={handleDrawerToggle}
        contentWidth={contentWidth}
        contentMargin={contentMargin}
      />
      <Box
        component="nav"
        sx={{ 
          width: isMobile ? 0 : (sidebarOpen ? drawerWidth : miniDrawerWidth),
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? sidebarOpen : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: isMobile ? drawerWidth : (sidebarOpen ? drawerWidth : miniDrawerWidth),
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: contentWidth,
          ml: isMobile ? 0 : 'auto',
          backgroundColor: 'background.default',
          height: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        
        <Box 
          sx={{ 
            pl: 3, 
            py: 1.5, 
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
          >
            <MuiLink 
              underline="hover" 
              color="inherit"
              sx={{ 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              {user?.role === ROLES.TEACHER ? 'Giáo viên' : 'Quản lý giáo viên'}
            </MuiLink>
            {sectionName && (
              <Typography color="primary" sx={{ fontWeight: 500 }}>
                {sectionName}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>
        
        <Box sx={{ 
          flexGrow: 1, 
          px: 3, 
          py: 2, 
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;