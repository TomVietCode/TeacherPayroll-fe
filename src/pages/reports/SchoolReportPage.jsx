import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { ReportAPI, SemesterAPI } from '../../services/api';

const SchoolReportPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchSemesters();
    }
  }, [selectedAcademicYear]);

  const fetchInitialData = async () => {
    try {
      const semestersResponse = await SemesterAPI.getAll();
      
      const uniqueYears = [...new Set(semestersResponse.data.data.map(s => s.academicYear))].sort();
      setAcademicYears(uniqueYears);
      
      // Auto-select the smallest (earliest) academic year
      if (uniqueYears.length > 0) {
        setSelectedAcademicYear(uniqueYears[0]); // Smallest year
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await SemesterAPI.getAll();
      const filteredSemesters = response.data.data.filter(s => s.academicYear === selectedAcademicYear);
      setSemesters(filteredSemesters);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedAcademicYear) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn năm học',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ReportAPI.getSchoolReport(
        selectedAcademicYear, 
        selectedSemesterId || null
      );
      setReportData(response.data.data);
      setSnackbar({
        open: true,
        message: 'Tạo báo cáo thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to generate report:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tạo báo cáo. Vui lòng thử lại sau.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData || !selectedAcademicYear) return;
    
    try {
      setLoading(true);
      const response = await ReportAPI.exportSchoolReport(selectedAcademicYear, selectedSemesterId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      const semesterSuffix = selectedSemesterId ? `-ky-${selectedSemesterId}` : '';
      let fileName = `bao-cao-tien-day-toan-truong-${selectedAcademicYear}${semesterSuffix}.xlsx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) fileName = fileNameMatch[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Xuất Excel thành công! File đã được tải về.',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xuất file Excel. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getReportTitle = () => {
    if (!reportData) return '';
    
    const year = reportData.academicYear;
    const semester = reportData.semester;
    
    if (semester) {
      return `Báo cáo tiền dạy toàn trường - Kỳ ${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''} năm học ${year}`;
    } else {
      return `Báo cáo tiền dạy toàn trường - Toàn năm học ${year}`;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" component="h1">
                Báo cáo tiền dạy toàn trường
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {reportData && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  Xuất Excel
                </Button>
              )}
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Form chọn năm học và kỳ học */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  label="Năm học"
                  disabled={loading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                >
                  {academicYears.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4} width="15%">
              <FormControl fullWidth>
                <InputLabel shrink={true}>Kỳ học</InputLabel>
                <Select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  label="Kỳ học"
                  disabled={loading}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return 'Tất cả các kỳ';
                    }
                    const semester = semesters.find(s => s.id === selected);
                    return semester ? `HK${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''}` : '';
                  }}
                  
                >
                  <MenuItem value="">Tất cả các kỳ</MenuItem>
                  {semesters.map(semester => (
                    <MenuItem key={semester.id} value={semester.id}>
                      HK{semester.termNumber}{semester.isSupplementary ? ' (Phụ)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading || !selectedAcademicYear}
                sx={{ height: '56px', width: '100%' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Tạo báo cáo'}
              </Button>
            </Grid>
          </Grid>

          {reportData && (
            <>
              <Divider sx={{ my: 3 }} />
              
              {/* Thống kê nhanh */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {reportData.departments.filter(dept => dept.totalSalary > 0).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khoa có hoạt động
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {reportData.summary.totalClasses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số lớp học
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {reportData.summary.totalConvertedPeriods}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tiết quy đổi
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {Math.round(reportData.summary.totalSalary / 1000000)}M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tiền (triệu VND)
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Thông tin tổng quan và hệ số */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6">{getReportTitle()}</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Năm học:</Typography>
                        <Chip 
                          label={reportData.academicYear}
                          size="small"
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Phạm vi:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.semester ? 
                            `Kỳ ${reportData.semester.termNumber}${reportData.semester.isSupplementary ? ' (Phụ)' : ''}` :
                            'Toàn năm học'
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Thông tin hệ số áp dụng
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Định mức tiền/tiết:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(reportData.coefficients.hourlyRate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Bảng báo cáo theo khoa */}
              <Typography variant="h6" gutterBottom>
                Báo cáo chi tiết theo khoa
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tên khoa</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số lớp dạy</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết quy đổi</strong></TableCell>
                      <TableCell align="right"><strong>Tổng số tiền dạy</strong></TableCell>
                      <TableCell align="right"><strong>% Tổng trường</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.departments.map((department) => {
                      const percentage = ((department.totalSalary / reportData.summary.totalSalary) * 100).toFixed(1);
                      
                      return (
                        <TableRow key={department.departmentId} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {department.departmentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ({department.departmentShortName})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{department.classCount}</TableCell>
                          <TableCell align="center">{department.totalPeriods}</TableCell>
                          <TableCell align="center">{department.totalConvertedPeriods}</TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="success.main">
                              {formatCurrency(department.totalSalary)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${isNaN(percentage) ? '0' : percentage}%`}
                              size="small"
                              color={percentage > 20 ? "success" : percentage > 10 ? "warning" : "default"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Tổng cộng toàn trường */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>TỔNG CỘNG TOÀN TRƯỜNG</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalClasses}</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalPeriods}</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalConvertedPeriods}</strong></TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          {formatCurrency(reportData.summary.totalSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label="100%"
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>


            </>
          )}

          {!reportData && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chọn năm học để tạo báo cáo.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SchoolReportPage; 