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
  Divider,
  TextField
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { ReportAPI, TeacherAPI, SemesterAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { canViewAllData, ROLES } from '../../utils/permissions';

const TeacherYearlyReportPage = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
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

  const fetchInitialData = async () => {
    try {
      const [teachersResponse, semestersResponse] = await Promise.all([
        TeacherAPI.getAll(),
        SemesterAPI.getAll()
      ]);

      setTeachers(teachersResponse.data.data || []);
      
      const uniqueYears = [...new Set(semestersResponse.data.data.map(s => s.academicYear))].sort();
      setAcademicYears(uniqueYears);
      
      // Auto-select the smallest (earliest) academic year
      if (uniqueYears.length > 0) {
        setSelectedAcademicYear(uniqueYears[0]); // Smallest year
      }

      // For teachers, auto-select their own teacher and generate report
      if (user?.role === ROLES.TEACHER && user?.teacher?.id) {
        setSelectedTeacherId(user.teacher.id);
        
        // Auto-generate report for the earliest year if available
        const yearToUse = uniqueYears.length > 0 ? uniqueYears[0] : null;
        if (yearToUse) {
          // Generate report automatically after state is set
          setTimeout(() => {
            generateReportForTeacher(user.teacher.id, yearToUse);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    }
  };

  const generateReportForTeacher = async (teacherId, academicYear) => {
    if (!teacherId || !academicYear) return;

    setLoading(true);
    setError(null);
    try {
      const response = await ReportAPI.getTeacherYearlyReport(teacherId, academicYear);
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

  const handleGenerateReport = async () => {
    if (!selectedTeacherId || !selectedAcademicYear) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn giáo viên và năm học',
        severity: 'warning'
      });
      return;
    }

    await generateReportForTeacher(selectedTeacherId, selectedAcademicYear);
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

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" component="h1">
                Báo cáo tiền dạy giáo viên theo năm
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

          {/* Form chọn giáo viên và năm học */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} width="30%">
              {canViewAllData(user?.role) ? (
              <FormControl fullWidth>
                <InputLabel>Giáo viên</InputLabel>
                <Select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  label="Giáo viên"
                  disabled={loading}
                >
                  {teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="Giáo viên"
                  value={user?.teacher ? `${user.teacher.fullName} (${user.teacher.code})` : ''}
                  disabled
                  variant="outlined"
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
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

            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading || !selectedTeacherId || !selectedAcademicYear}
                sx={{ height: '56px', width: '100%' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Tạo báo cáo'}
              </Button>
            </Grid>
          </Grid>

          {reportData && (
            <>
              <Divider sx={{ my: 3 }} />
                            {/* Thông tin giáo viên và hệ số cùng 1 hàng */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6">Thông tin giáo viên</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Họ tên:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.teacher.fullName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Mã giáo viên:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.teacher.code}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Bằng cấp:</Typography>
                        <Chip 
                          label={reportData.teacher.degree.fullName}
                          size="small"
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Khoa:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.teacher.department.fullName}
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Hệ số giáo viên:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reportData.coefficients.teacherCoefficient}
                        </Typography>
                      </Grid>
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
              {/* Bảng báo cáo theo kỳ */}
              <Typography variant="h6" gutterBottom>
                Báo cáo chi tiết theo kỳ - Năm học {reportData.academicYear}
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Kỳ học</strong></TableCell>
                      <TableCell align="center"><strong>Số lớp đã dạy</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết</strong></TableCell>
                      <TableCell align="center"><strong>Tổng số tiết quy đổi</strong></TableCell>
                      <TableCell align="right"><strong>Tổng số tiền dạy của kỳ</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.semesters.map((semester) => (
                      <TableRow key={semester.semesterId} hover>
                        <TableCell>
                          <Chip 
                            label={semester.semesterName}
                            color={semester.isSupplementary ? "warning" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{semester.classCount}</TableCell>
                        <TableCell align="center">{semester.totalPeriods}</TableCell>
                        <TableCell align="center">{semester.totalConvertedPeriods}</TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(semester.totalSalary)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Tổng cộng */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>TỔNG CỘNG</strong></TableCell>
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
                Vui lòng chọn giáo viên và năm học để tạo báo cáo.
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

export default TeacherYearlyReportPage; 