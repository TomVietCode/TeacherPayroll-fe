import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, MenuItem, 
  FormControl, InputLabel, Select, Button,
  CircularProgress, Alert
} from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { StatisticsAPI } from '../../services/api';

const CourseClassStatistics = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch available academic years
    const fetchAcademicYears = async () => {
      setLoading(true);
      try {
        const response = await StatisticsAPI.getAcademicYears();
        // Ensure we have an array
        const years = Array.isArray(response.data) ? response.data : [];
        setAcademicYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (err) {
        console.error('Error fetching academic years:', err);
        setError('Không thể tải danh sách năm học. Vui lòng thử lại sau.');
        setAcademicYears([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAcademicYears();
  }, []);
  
  useEffect(() => {
    if (selectedYear) {
      fetchStatistics();
    }
  }, [selectedYear]);
  
  const fetchStatistics = async () => {
    if (!selectedYear) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await StatisticsAPI.courseClasses(selectedYear);
      setStatistics(response.data || []);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportExcel = async () => {
    if (!selectedYear || statistics.length === 0) return;
    
    setIsExportingExcel(true);
    try {
      const response = await StatisticsAPI.exportCourseClasses(selectedYear);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `thong-ke-lop-hoc-phan-${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError('Không thể xuất file Excel. Vui lòng thử lại sau.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Render data table
  const renderDataTable = () => {
    if (statistics.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Không có dữ liệu thống kê cho năm học này</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead" sx={{ backgroundColor: 'primary.light' }}>
            <Box component="tr">
              <Box component="th" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
                Mã học phần
              </Box>
              <Box component="th" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
                Tên học phần
              </Box>
              <Box component="th" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                Số lớp mở
              </Box>
              <Box component="th" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                Tổng số sinh viên
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {statistics.map((row) => (
              <Box component="tr" key={row.subjectId}>
                <Box component="td" sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  {row.subjectCode}
                </Box>
                <Box component="td" sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  {row.subjectName}
                </Box>
                <Box component="td" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  {row.classCount}
                </Box>
                <Box component="td" sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  {row.totalStudents}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with year selector and export button */}
      <Paper sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">Thống kê lớp học phần</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="academic-year-label">Năm học</InputLabel>
            <Select
              labelId="academic-year-label"
              value={selectedYear}
              label="Năm học"
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={loading || academicYears.length === 0}
            >
              {academicYears.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={isExportingExcel ? <CircularProgress size={16} /> : <FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={loading || statistics.length === 0 || isExportingExcel}
            size="small"
          >
            {isExportingExcel ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
        </Box>
      </Paper>
      
      {/* Error message display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Main content area */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mb: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          p: 2, 
          minHeight: 400,
          overflow: 'auto'
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            renderDataTable()
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CourseClassStatistics; 