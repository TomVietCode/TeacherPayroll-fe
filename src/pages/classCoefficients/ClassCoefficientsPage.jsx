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
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ClassCoefficientAPI, SemesterAPI } from '../../services/api';

function ClassCoefficientsPage() {
  const [classCoefficient, setClassCoefficient] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [validRanges, setValidRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pendingChange, setPendingChange] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchClassCoefficient();
    }
  }, [selectedAcademicYear]);

  const fetchInitialData = async () => {
    try {
      const [semestersResponse, rangesResponse] = await Promise.all([
        SemesterAPI.getAll(),
        ClassCoefficientAPI.getValidStudentRanges()
      ]);
      
      const uniqueYears = [...new Set(semestersResponse.data.data.map(s => s.academicYear))].sort().reverse();
      setAcademicYears(uniqueYears);
      setValidRanges(rangesResponse.data.data || []);
      
      // Auto-select the latest academic year
      if (uniqueYears.length > 0) {
        setSelectedAcademicYear(uniqueYears[0]);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Không thể tải dữ liệu ban đầu');
    }
  };

  const fetchClassCoefficient = async () => {
    if (!selectedAcademicYear) return;
    
    setLoading(true);
    setError(null);
    setPendingChange('');
    try {
      const response = await ClassCoefficientAPI.getByAcademicYear(selectedAcademicYear);
      setClassCoefficient(response.data.data);
      setPendingChange(response.data.data?.standardStudentRange || '40-49');
    } catch (err) {
      console.error('Failed to fetch class coefficient:', err);
      setError('Không thể tải dữ liệu hệ số lớp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardRangeChange = (newRange) => {
    setPendingChange(newRange);
  };

  const handleSaveChanges = async () => {
    if (!pendingChange || !selectedAcademicYear) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn khoảng số sinh viên chuẩn',
        severity: 'warning'
      });
      return;
    }

    if (pendingChange === classCoefficient?.standardStudentRange) {
      setSnackbar({
        open: true,
        message: 'Không có thay đổi nào để lưu',
        severity: 'info'
      });
      return;
    }

    setSaving(true);
    try {
      await ClassCoefficientAPI.updateByAcademicYear(selectedAcademicYear, {
        standardStudentRange: pendingChange
      });

      setSnackbar({
        open: true,
        message: 'Cập nhật hệ số lớp thành công!',
        severity: 'success'
      });
      
      fetchClassCoefficient();
    } catch (error) {
      console.error('Failed to save class coefficient:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật hệ số lớp';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate coefficient for each range based on selected standard
  const calculateCoefficient = (range, standardRange) => {
    const ranges = [
      '<20', '20-29', '30-39', '40-49', '50-59', 
      '60-69', '70-79', '80-89', '90-99', '100+'
    ];
    
    const standardIndex = ranges.indexOf(standardRange);
    const currentIndex = ranges.indexOf(range);
    
    if (standardIndex === -1 || currentIndex === -1) return 0;
    
    const difference = currentIndex - standardIndex;
    return difference * 0.1;
  };

  const hasChanges = pendingChange !== classCoefficient?.standardStudentRange;

  if (loading && !classCoefficient) {
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h5" component="h1">
                Hệ số lớp
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchClassCoefficient}
                disabled={saving || !selectedAcademicYear}
              >
                Làm mới
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={saving || !hasChanges}
                color={hasChanges ? 'primary' : 'inherit'}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Thiết lập hệ số áp dụng cho từng lớp học phần dựa trên số sinh viên chuẩn theo từng năm học. 
            Hệ số này được sử dụng để điều chỉnh tiền dạy dựa trên quy mô lớp học.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {hasChanges && (
            <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
              Bạn đã thay đổi khoảng số sinh viên chuẩn. 
              Nhấn "Lưu thay đổi" để áp dụng và tính lại hệ số cho tất cả các lớp học phần.
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  label="Năm học"
                  disabled={saving}
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
              <FormControl fullWidth>
                <InputLabel>Số sinh viên chuẩn</InputLabel>
                <Select
                  value={pendingChange}
                  onChange={(e) => handleStandardRangeChange(e.target.value)}
                  label="Số sinh viên chuẩn"
                  disabled={saving || !selectedAcademicYear}
                >
                  {validRanges.map(range => (
                    <MenuItem key={range} value={range}>
                      {range} sinh viên
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {selectedAcademicYear && pendingChange && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                Bảng hệ số tự động tính theo khoảng sinh viên chuẩn: {pendingChange}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hệ số được tính dựa trên quy tắc: mỗi khoảng cách 10 sinh viên so với chuẩn sẽ thay đổi hệ số ±0.1
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center"><strong>Khoảng số sinh viên</strong></TableCell>
                      <TableCell align="center"><strong>Hệ số lớp</strong></TableCell>
                      <TableCell align="center"><strong>Loại</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validRanges.map((range) => {
                      const coefficient = calculateCoefficient(range, pendingChange);
                      const isStandard = range === pendingChange;
                      const isPositive = coefficient > 0;
                      const isNegative = coefficient < 0;
                      
                      return (
                        <TableRow 
                          key={range} 
                          hover
                          sx={{ backgroundColor: isStandard ? '#e3f2fd' : 'transparent' }}
                        >
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                              {range} sinh viên
                              {isStandard && (
                                <Chip label="CHUẨN" color="primary" size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="h6" 
                              color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.primary'}
                              sx={{ fontWeight: isStandard ? 'bold' : 'normal' }}
                            >
                              {coefficient >= 0 ? '+' : ''}{coefficient.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {isStandard ? (
                              <Chip label="Chuẩn" color="primary" size="small" />
                            ) : isPositive ? (
                              <Chip label="Thưởng" color="success" size="small" />
                            ) : isNegative ? (
                              <Chip label="Phạt" color="error" size="small" />
                            ) : (
                              <Chip label="Trung tính" color="default" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {!selectedAcademicYear && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chọn năm học để thiết lập hệ số lớp.
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

export default ClassCoefficientsPage; 