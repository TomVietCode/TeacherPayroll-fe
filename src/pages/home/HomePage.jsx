import { Typography, Card, CardContent, Grid, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DomainIcon from '@mui/icons-material/Domain';
import PersonIcon from '@mui/icons-material/Person';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, icon, path, description, color }) => {
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
        }
      }}
      onClick={() => navigate(path)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

const HomePage = () => {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Trang Chủ - Quản Lý Giáo Viên
      </Typography>
      <Typography variant="body1" paragraph>
        Chào mừng đến với hệ thống quản lý giáo viên và tính lương của Đại học Phenikaa
      </Typography>
      
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Quản Lý Bằng Cấp"
            icon={<SchoolIcon fontSize="large" color="primary" />}
            path="/degrees"
            color="primary"
            description="Quản lý các loại bằng cấp và hệ số lương tương ứng"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Quản Lý Khoa/Bộ Môn"
            icon={<DomainIcon fontSize="large" color="secondary" />}
            path="/departments"
            color="secondary"
            description="Quản lý các khoa và bộ môn trong trường"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Quản Lý Giáo Viên"
            icon={<PersonIcon fontSize="large" color="info" />}
            path="/teachers"
            color="info"
            description="Quản lý thông tin và lương của giáo viên"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Thống Kê"
            icon={<EqualizerIcon fontSize="large" color="success" />}
            path="/statistics"
            color="success"
            description="Xem báo cáo thống kê về giáo viên và lương"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default HomePage;
