import { useState, useEffect } from 'react';
import { Box, Alert, Tabs, Tab, Typography, Paper } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { StatisticsAPI } from '../../services/api';
import TeacherStatisticsPage from './TeacherStatisticsPage';

const StatisticsPage = () => {
  const [statsByDepartment, setStatsByDepartment] = useState([]);
  const [statsByDegree, setStatsByDegree] = useState([]);
  const [statsByAge, setStatsByAge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [departmentResponse, degreeResponse, ageResponse] = await Promise.all([
        StatisticsAPI.byDepartment(),
        StatisticsAPI.byDegree(),
        StatisticsAPI.byAge()
      ]);
      
      // Extract data and total from responses
      setStatsByDepartment(departmentResponse.data.data || []);
      setStatsByDegree(degreeResponse.data.data || []);
      setStatsByAge(ageResponse.data.data || []);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Department statistics columns
  const departmentColumns = [
    { id: 'shortName', label: 'Tên viết tắt', width: '15%' },
    { id: 'fullName', label: 'Tên khoa', width: '55%' },
    { 
      id: 'count', 
      label: 'Số lượng giáo viên', 
      width: '30%',
      align: 'center',
      render: (row) => row.count
    }
  ];

  // Degree statistics columns
  const degreeColumns = [
    { id: 'shortName', label: 'Tên viết tắt', width: '15%' },
    { id: 'fullName', label: 'Tên bằng cấp', width: '55%' },
    { 
      id: 'count', 
      label: 'Số lượng giáo viên', 
      width: '30%',
      align: 'center',
      render: (row) => row.count
    }
  ];

  // Age statistics columns
  const ageColumns = [
    { id: 'label', label: 'Nhóm tuổi', width: '70%' },
    { 
      id: 'count', 
      label: 'Số lượng giáo viên', 
      width: '30%',
      align: 'center',
      render: (row) => row.count
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* View mode selector */}
      <Paper sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Thống kê giáo viên</Typography>
        <Box>
          <Tabs value={viewMode} onChange={(e, val) => handleViewModeChange(val)}>
            <Tab label="Bảng" value="table" />
            <Tab label="Biểu đồ" value="chart" />
          </Tabs>
        </Box>
      </Paper>

      {viewMode === 'table' ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Thống kê theo khoa" />
              <Tab label="Thống kê theo bằng cấp" />
              <Tab label="Thống kê theo độ tuổi" />
            </Tabs>
          </Box>

          <Box sx={{ flexGrow: 1, display: activeTab === 0 ? 'block' : 'none' }}>
            <CustomTable
              columns={departmentColumns}
              data={statsByDepartment}
              loading={loading}
              pagination={false}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: activeTab === 1 ? 'block' : 'none' }}>
            <CustomTable
              columns={degreeColumns}
              data={statsByDegree}
              loading={loading}
              pagination={false}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: activeTab === 2 ? 'block' : 'none' }}>
            <CustomTable
              columns={ageColumns}
              data={statsByAge}
              loading={loading}
              pagination={false}
            />
          </Box>
        </>
      ) : (
        <TeacherStatisticsPage />
      )}
    </Box>
  );
};

export default StatisticsPage;
