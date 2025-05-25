import { useState, useEffect } from 'react';
import { 
  Box, 
  Alert, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  Button, 
  Menu, 
  MenuItem, 
  Snackbar, 
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  FileDownload as FileDownloadIcon, 
  GetApp as GetAppIcon,
  TableChart as TableChartIcon 
} from '@mui/icons-material';
import CustomTable from '../../components/common/CustomTable';
import { StatisticsAPI } from '../../services/api';
import TeacherStatisticsPage from './TeacherStatisticsPage';
import { exportStatisticsToExcel, exportSingleStatisticsToExcel } from '../../utils/excelExport';

const StatisticsPage = () => {
  const [statsByDepartment, setStatsByDepartment] = useState([]);
  const [statsByDegree, setStatsByDegree] = useState([]);
  const [statsByAge, setStatsByAge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    handleExportMenuClose();
    
    try {
      const success = exportStatisticsToExcel(statsByDepartment, statsByDegree, statsByAge);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Xuất Excel thành công! File đã được tải về.',
          severity: 'success'
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi xuất Excel. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrent = async () => {
    setIsExporting(true);
    handleExportMenuClose();
    
    try {
      let success = false;
      let data, type;
      
      switch (activeTab) {
        case 0:
          data = statsByDepartment;
          type = 'department';
          break;
        case 1:
          data = statsByDegree;
          type = 'degree';
          break;
        case 2:
          data = statsByAge;
          type = 'age';
          break;
        default:
          throw new Error('Invalid tab');
      }
      
      success = exportSingleStatisticsToExcel(data, type);
      
      if (success) {
        setSnackbar({
          open: true,
          message: 'Xuất Excel thành công! File đã được tải về.',
          severity: 'success'
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi xuất Excel. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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

  const getCurrentTabName = () => {
    switch (activeTab) {
      case 0: return 'thống kê theo khoa';
      case 1: return 'thống kê theo bằng cấp';
      case 2: return 'thống kê theo độ tuổi';
      default: return 'thống kê hiện tại';
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* View mode selector with export buttons */}
      <Paper sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Thống kê giáo viên</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {viewMode === 'table' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Xuất Excel">
                <Button
                  variant="outlined"
                  startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                  onClick={handleExportMenuOpen}
                  disabled={isExporting || loading}
                  size="small"
                >
                  {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                </Button>
              </Tooltip>
              
              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={handleExportMenuClose}
                PaperProps={{
                  sx: { minWidth: 200 }
                }}
              >
                <MenuItem onClick={handleExportAll}>
                  <GetAppIcon sx={{ mr: 1 }} />
                  Xuất tất cả (3 sheet)
                </MenuItem>
                <MenuItem onClick={handleExportCurrent}>
                  <TableChartIcon sx={{ mr: 1 }} />
                  Xuất {getCurrentTabName()}
                </MenuItem>
              </Menu>
            </Box>
          )}
          
          <Box>
            <Tabs value={viewMode} onChange={(e, val) => handleViewModeChange(val)}>
              <Tab label="Bảng" value="table" />
              <Tab label="Biểu đồ" value="chart" />
            </Tabs>
          </Box>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatisticsPage;