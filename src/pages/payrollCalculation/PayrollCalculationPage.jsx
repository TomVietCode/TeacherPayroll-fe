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
  Autocomplete,
  TextField
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { PayrollAPI, TeacherAPI, SemesterAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { canViewAllData, ROLES } from '../../utils/permissions';

function PayrollCalculationPage() {
  const { user } = useAuth();
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [payrollResult, setPayrollResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchSemestersByAcademicYear();
    } else {
      setSemesters([]);
      setSelectedSemester(null);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    setPayrollResult(null);
  }, [selectedAcademicYear, selectedSemester, selectedTeacher]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [academicYearsResponse, teachersResponse] = await Promise.all([
        PayrollAPI.getValidAcademicYears(),
        TeacherAPI.getAll()
      ]);
      
      setAcademicYears(academicYearsResponse.data.data || []);
      setTeachers(teachersResponse.data.data || []);
      // For teachers, auto-select their own teacher
      if (user?.role === ROLES.TEACHER && user?.teacher) {
        const teacherData = teachersResponse.data.data?.find(t => t.id === user.teacher.id);
        if (teacherData) {
          setSelectedTeacher(teacherData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemestersByAcademicYear = async () => {
    try {
      const response = await SemesterAPI.getAll();
      const filteredSemesters = response.data.data.filter(s => s.academicYear === selectedAcademicYear);
      setSemesters(filteredSemesters);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
      setError('Không thể tải danh sách kỳ học');
    }
  };

  const handleCalculate = async () => {
    if (!selectedAcademicYear || !selectedSemester || !selectedTeacher) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn đầy đủ năm học, kỳ học và giáo viên',
        severity: 'warning'
      });
      return;
    }

    setCalculating(true);
    setError(null);
    try {
      const response = await PayrollAPI.calculate({
        academicYear: selectedAcademicYear,
        semesterId: selectedSemester.id,
        teacherId: selectedTeacher.id
      });
      
      setPayrollResult(response.data.data);
      setSnackbar({
        open: true,
        message: 'Tính tiền dạy thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to calculate payroll:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tính tiền dạy';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getSemesterDisplayName = (semester) => {
    const termText = semester.isSupplementary ? `${semester.termNumber} (phụ)` : semester.termNumber;
    return `HK${termText}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h5" component="h1">
              Tính tiền dạy
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Selection Form */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chọn thông tin tính toán
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} width={"12%"}>
                  <FormControl fullWidth required>
                    <InputLabel>Năm học</InputLabel>
                    <Select
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      label="Năm học"
                      disabled={calculating}
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

                <Grid item xs={12} sm={6} md={4} width={"12%"}>
                  <FormControl fullWidth required>
                    <InputLabel>Kỳ học</InputLabel>
                    <Select
                      value={selectedSemester?.id || ''}
                      onChange={(e) => {
                        const semester = semesters.find(s => s.id === e.target.value);
                        setSelectedSemester(semester);
                      }}
                      label="Kỳ học"
                      disabled={calculating || !selectedAcademicYear}
                    >
                      {semesters.map(semester => (
                        <MenuItem key={semester.id} value={semester.id}>
                          {getSemesterDisplayName(semester)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4} width={"30%"}>
                  {canViewAllData(user?.role) ? (
                    <Autocomplete
                      options={teachers}
                      getOptionLabel={(teacher) => `${teacher.fullName} (${teacher.code})`}
                      value={selectedTeacher}
                      onChange={(event, newValue) => setSelectedTeacher(newValue)}
                      disabled={calculating}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Giáo viên *"
                          variant="outlined"
                        />
                      )}
                      renderOption={(props, teacher) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body1">
                              {teacher.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {teacher.code} - {teacher.degree?.fullName}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Giáo viên"
                      value={selectedTeacher ? `${selectedTeacher.fullName} (${selectedTeacher.code})` : ''}
                      disabled
                      variant="outlined"
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    onClick={handleCalculate}
                    disabled={calculating || !selectedAcademicYear || !selectedSemester || !selectedTeacher}
                    size="large"
                    sx={{ padding: "13px 15px", height: "100%"}}
                  > 
                    {calculating ? 'Đang tính...' : 'Tính tiền dạy'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Results */}
          {payrollResult && (
            <>
              {/* Summary Information */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin tổng quan
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="subtitle2">Giáo viên</Typography>
                      </Box>
                      <Typography variant="body1">{payrollResult.teacher.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payrollResult.teacher.code}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="subtitle2">Bằng cấp</Typography>
                      </Box>
                      <Typography variant="body1">{payrollResult.teacher.degree.fullName}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingUpIcon color="primary" />
                        <Typography variant="subtitle2">Hệ số giáo viên</Typography>
                      </Box>
                      <Typography variant="h6" color="primary">
                        {payrollResult.coefficients.teacherCoefficient}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MoneyIcon color="primary" />
                        <Typography variant="subtitle2">Tiền dạy một tiết</Typography>
                      </Box>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(payrollResult.coefficients.hourlyRate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Classes Details */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chi tiết lớp học phần
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Mã lớp</strong></TableCell>
                          <TableCell><strong>Tên học phần</strong></TableCell>
                          <TableCell align="center"><strong>Số tiết</strong></TableCell>
                          <TableCell align="center"><strong>Số SV</strong></TableCell>
                          <TableCell align="center"><strong>Hệ số HP</strong></TableCell>
                          <TableCell align="center"><strong>Hệ số lớp</strong></TableCell>
                          <TableCell align="center"><strong>Tiết quy đổi</strong></TableCell>
                          <TableCell align="right"><strong>Tiền dạy</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payrollResult.classes.map((classItem) => (
                          <TableRow key={classItem.courseClassId} hover>
                            <TableCell>
                              <Chip label={classItem.courseClassCode} size="small" />
                            </TableCell>
                            <TableCell>{classItem.subjectName}</TableCell>
                            <TableCell align="center">{classItem.totalPeriods}</TableCell>
                            <TableCell align="center">{classItem.studentCount}</TableCell>
                            <TableCell align="center">{classItem.subjectCoefficient}</TableCell>
                            <TableCell align="center">
                              <Typography
                                color={(classItem.classCoefficient).toFixed(1)   > 0 ? 'success.main' : 
                                       (classItem.classCoefficient).toFixed(1) < 0 ? 'error.main' : 'text.primary'}
                              >
                                {(classItem.classCoefficient).toFixed(1) >= 0 ? '+' : ''}{(classItem.classCoefficient).toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography fontWeight="medium">
                                {classItem.convertedPeriods}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" color="success.main">
                                {formatCurrency(classItem.classSalary)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Total */}
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Tổng tiền dạy trong kỳ
                    </Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {formatCurrency(payrollResult.totalSalary)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Kết quả tính toán vào: {new Date(payrollResult.calculatedAt).toLocaleString('vi-VN')}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}

          {/* Empty state */}
          {!payrollResult && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalculateIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có kết quả tính toán
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chọn năm học, kỳ học và giáo viên để bắt đầu tính tiền dạy.
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
}

export default PayrollCalculationPage; 