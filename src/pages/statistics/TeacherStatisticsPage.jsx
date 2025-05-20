import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import { StatisticsAPI } from '../../services/api';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const TeacherStatisticsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    byDepartment: [],
    byDegree: [],
    byAge: [],
    total: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, [tabIndex]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      switch (tabIndex) {
        case 0: // Department statistics
          response = await StatisticsAPI.byDepartment();
          setStatistics(prev => ({ 
            ...prev, 
            byDepartment: response.data.data || [],
            total: response.data.total || 0
          }));
          break;
        
        case 1: // Degree statistics
          response = await StatisticsAPI.byDegree();
          setStatistics(prev => ({ 
            ...prev, 
            byDegree: response.data.data || [],
            total: response.data.total || 0
          }));
          break;
        
        case 2: // Age statistics
          response = await StatisticsAPI.byAge();
          setStatistics(prev => ({ 
            ...prev, 
            byAge: response.data.data || [],
            total: response.data.total || 0
          }));
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  // Custom tooltip formatter that ignores the name parameter
  const tooltipFormatter = (value) => [value, 'Số lượng'];

  const renderDepartmentStats = () => {
    // Filter zero counts only for pie chart
    const pieData = statistics.byDepartment.filter(dept => dept.count > 0);
    // Use all data for bar chart
    const barData = statistics.byDepartment;
    
    if (statistics.byDepartment.length === 0) {
      return <Typography textAlign="center">Không có dữ liệu</Typography>;
    }
    
    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ tròn phân bố giáo viên theo khoa
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  nameKey="fullName"
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label={({ fullName, count }) => `${fullName}: ${count}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ cột phân bố giáo viên theo khoa
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="count" name="Số lượng" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  const renderDegreeStats = () => {
    // Filter zero counts only for pie chart
    const pieData = statistics.byDegree.filter(degree => degree.count > 0);
    // Use all data for bar chart
    const barData = statistics.byDegree;
    
    if (statistics.byDegree.length === 0) {
      return <Typography textAlign="center">Không có dữ liệu</Typography>;
    }
    
    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ tròn phân bố giáo viên theo bằng cấp
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  nameKey="fullName"
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label={({ fullName, count }) => `${fullName}: ${count}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ cột phân bố giáo viên theo bằng cấp
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="count" name="Số lượng" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  const renderAgeStats = () => {
    // Filter zero counts only for pie chart
    const pieData = statistics.byAge.filter(ageGroup => ageGroup.count > 0);
    // Use all data for bar chart
    const barData = statistics.byAge;
    
    if (statistics.byAge.length === 0) {
      return <Typography textAlign="center">Không có dữ liệu</Typography>;
    }
    
    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ tròn phân bố giáo viên theo độ tuổi
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  nameKey="label"
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label={({ label, count }) => `${label}: ${count}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '450px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Biểu đồ cột phân bố giáo viên theo độ tuổi
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="count" name="Số lượng" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Thống kê theo khoa" />
          <Tab label="Thống kê theo bằng cấp" />
          <Tab label="Thống kê theo độ tuổi" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={3}>
          {/* Render based on selected tab */}
          {tabIndex === 0 && renderDepartmentStats()}
          {tabIndex === 1 && renderDegreeStats()}
          {tabIndex === 2 && renderAgeStats()}
          
          {/* Total teachers count */}
          <Paper sx={{ mt: 2, p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              Tổng số giáo viên: {statistics.total}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default TeacherStatisticsPage; 