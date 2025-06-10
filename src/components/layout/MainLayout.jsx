import { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  ListItemButton, Divider, Container, useMediaQuery,
  Collapse, Breadcrumbs, Link as MuiLink
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
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
import { useLocation, useNavigate } from 'react-router-dom';

// Helper function to get section name from path
const getSectionName = (path) => {
  if (path === '/' || path === '/statistics') return 'Thống kê';
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
  return '';
};

// Full drawer width and mini drawer width when collapsed
const drawerWidth = 240;
const miniDrawerWidth = 64;

function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Default open on desktop, closed on mobile
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(true);
  const [classMenuOpen, setClassMenuOpen] = useState(true);
  const [payrollMenuOpen, setPayrollMenuOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTeacherMenuToggle = () => {
    if (sidebarOpen) {
      setTeacherMenuOpen(!teacherMenuOpen);
    } else {
      setSidebarOpen(true);
      setTeacherMenuOpen(true);
    }
  };

  const handleClassMenuToggle = () => {
    if (sidebarOpen) {
      setClassMenuOpen(!classMenuOpen);
    } else {
      setSidebarOpen(true);
      setClassMenuOpen(true);
    }
  };

  const handlePayrollMenuToggle = () => {
    if (sidebarOpen) {
      setPayrollMenuOpen(!payrollMenuOpen);
    } else {
      setSidebarOpen(true);
      setPayrollMenuOpen(true);
    }
  };

  // Submenu items for teacher management
  const teacherSubMenuItems = [
    { text: 'Thống kê', icon: <EqualizerIcon />, path: '/' },
    { text: 'Bằng cấp', icon: <SchoolIcon />, path: '/degrees' },
    { text: 'Khoa', icon: <DomainIcon />, path: '/departments' },
    { text: 'Giáo viên', icon: <PersonIcon />, path: '/teachers' },
  ];

  // Submenu items for class management (including teacher assignments)
  const classSubMenuItems = [
    { text: 'Học phần', icon: <BookIcon />, path: '/subjects' },
    { text: 'Kỳ học', icon: <CalendarTodayIcon />, path: '/semesters' },
    { text: 'Lớp học phần', icon: <GroupWorkIcon />, path: '/course-classes' },
    { text: 'Phân công giáo viên', icon: <AssignmentIcon />, path: '/teacher-assignments' },
    { text: 'Thống kê lớp học phần', icon: <EqualizerIcon />, path: '/course-class-statistics' },
  ];

  // Submenu items for payroll management
  const payrollSubMenuItems = [
    { text: 'Định mức tiền theo tiết', icon: <AttachMoneyIcon />, path: '/hourly-rates' },
    { text: 'Hệ số giáo viên', icon: <TrendingUpIcon />, path: '/teacher-coefficients' },
    { text: 'Hệ số lớp', icon: <SettingsIcon />, path: '/class-coefficients' },
    { text: 'Tính tiền dạy', icon: <CalculateIcon />, path: '/payroll-calculation' },
  ];
  
  const drawer = (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {sidebarOpen && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, pl: 1 }}>
            Quản lý tiền dạy
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {/* Teacher Management Dropdown */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleTeacherMenuToggle}
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
              <PeopleIcon />
            </ListItemIcon>
            {sidebarOpen && (
              <>
                <ListItemText primary="Quản lý giáo viên" />
                {teacherMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {/* Teacher Submenu items */}
        <Collapse in={sidebarOpen && teacherMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {teacherSubMenuItems.map((item) => (
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

        {/* Class Management Dropdown (now includes Teacher Assignment) */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleClassMenuToggle}
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
              <ClassIcon />
            </ListItemIcon>
            {sidebarOpen && (
              <>
                <ListItemText primary="Quản lý lớp học phần" />
                {classMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {/* Class Submenu items (including Teacher Assignment) */}
        <Collapse in={sidebarOpen && classMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {classSubMenuItems.map((item) => (
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

        {/* Payroll Management Dropdown */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handlePayrollMenuToggle}
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
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            {sidebarOpen && (
              <>
                <ListItemText primary="Tính tiền dạy" />
                {payrollMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {/* Payroll Submenu items */}
        <Collapse in={sidebarOpen && payrollMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {payrollSubMenuItems.map((item) => (
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
      <AppBar 
        position="fixed" 
        sx={{
          width: contentWidth,
          ml: contentMargin,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Phần mềm tính tiền dạy cho giáo viên
          </Typography>
        </Toolbar>
      </AppBar>
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
            keepMounted: true // Better open performance on mobile
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
        
        {/* Breadcrumb navigation - moved below header */}
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
              Quản lý giáo viên
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