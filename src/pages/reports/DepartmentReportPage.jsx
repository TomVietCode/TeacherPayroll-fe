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
  Business as BusinessIcon
} from '@mui/icons-material';
import { ReportAPI, DepartmentAPI, SemesterAPI } from '../../services/api';

const DepartmentReportPage = () => {
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
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
      const [departmentsResponse, semestersResponse] = await Promise.all([
        DepartmentAPI.getAll(),
        SemesterAPI.getAll()
      ]);

      setDepartments(departmentsResponse.data.data || []);
      
      const uniqueYears = [...new Set(semestersResponse.data.data.map(s => s.academicYear))].sort();
      setAcademicYears(uniqueYears);
      
      // Chọn năm hiện tại hoặc năm gần nhất
      const currentYear = new Date().getFullYear();
      const currentAcademicYear = uniqueYears.find(year => {
        const startYear = parseInt(year.split('-')[0]);
        return startYear === currentYear || startYear === currentYear - 1;
      });
      
      if (currentAcademicYear) {
        setSelectedAcademicYear(currentAcademicYear);
      } else if (uniqueYears.length > 0) {
        setSelectedAcademicYear(uniqueYears[uniqueYears.length - 1]); // Năm gần nhất
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
    if (!selectedDepartmentId || !selectedAcademicYear) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn khoa và năm học',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ReportAPI.getDepartmentReport(
        selectedDepartmentId, 
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
    if (!reportData) return;
    
    // TODO: Implement Excel export functionality
    setSnackbar({
      open: true,
      message: 'Chức năng xuất Excel sẽ được bổ sung sau',
      severity: 'info'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getReportTitle = () => {
    if (!reportData) return '';
    
    const departmentName = reportData.department.fullName;
    const year = reportData.academicYear;
    const semester = reportData.semester;
    
    if (semester) {
      return `Báo cáo tiền dạy khoa ${departmentName} - Kỳ ${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''} năm học ${year}`;
    } else {
      return `Báo cáo tiền dạy khoa ${departmentName} - Toàn năm học ${year}`;
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
                Báo cáo tiền dạy theo khoa
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchInitialData}
                disabled={loading}
              >
                Làm mới
              </Button>
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

          {/* Form chọn khoa, năm học và kỳ học */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3} width="25%">
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  label="Khoa"
                  disabled={loading}
                >
                  {departments.map(department => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  label="Năm học"
                  disabled={loading}
                >
                  {academicYears.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} width="15%">
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
                    return semester ? `Kỳ ${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''}` : '';
                  }}
                >
                  <MenuItem value="">Tất cả các kỳ</MenuItem>
                  {semesters.map(semester => (
                    <MenuItem key={semester.id} value={semester.id}>
                      Kỳ {semester.termNumber}{semester.isSupplementary ? ' (Phụ)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading || !selectedDepartmentId || !selectedAcademicYear}
                sx={{ height: '56px', width: '100%' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Tạo báo cáo'}
              </Button>
            </Grid>
          </Grid>

          {reportData && (
            <>
              <Divider sx={{ my: 3 }} />
                            {/* Thông tin khoa và hệ số cùng 1 hàng */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="h6">Thông tin khoa</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tên khoa:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.department.fullName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tên viết tắt:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.department.shortName}
                        </Typography>
                      </Grid>
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
              {/* Bảng báo cáo theo giáo viên */}
              <Typography variant="h6" gutterBottom>
                Danh sách giáo viên trong khoa
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tên giáo viên</strong></TableCell>
                      <TableCell align="center"><strong>Bằng cấp</strong></TableCell>
                      <TableCell align="center"><strong>Hệ số GV</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số lớp dạy</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết quy đổi</strong></TableCell>
                      <TableCell align="right"><strong>Tổng số tiền dạy</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.teachers.map((teacher) => (
                      <TableRow key={teacher.teacherId} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {teacher.teacherName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {teacher.teacherCode}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={teacher.degree.shortName}
                            size="small"
                            color="default"
                          />
                        </TableCell>
                        <TableCell align="center">{teacher.teacherCoefficient}</TableCell>
                        <TableCell align="center">{teacher.classCount}</TableCell>
                        <TableCell align="center">{teacher.totalPeriods}</TableCell>
                        <TableCell align="center">{teacher.totalConvertedPeriods}</TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(teacher.totalSalary)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Tổng cộng khoa */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={3}><strong>TỔNG CỘNG KHOA</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalClasses}</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalPeriods}</strong></TableCell>
                      <TableCell align="center"><strong>{reportData.summary.totalConvertedPeriods}</strong></TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          {formatCurrency(reportData.summary.totalSalary)}
                        </Typography>
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
                Vui lòng chọn khoa và năm học để tạo báo cáo.
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

export default DepartmentReportPage; 