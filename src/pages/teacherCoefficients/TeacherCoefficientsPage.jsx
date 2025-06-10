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
  TextField,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { TeacherCoefficientAPI, SemesterAPI } from '../../services/api';

function TeacherCoefficientsPage() {
  const [coefficients, setCoefficients] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchCoefficients();
    }
  }, [selectedAcademicYear]);

  const fetchAcademicYears = async () => {
    try {
      const response = await SemesterAPI.getAll();
      const uniqueYears = [...new Set(response.data.data.map(s => s.academicYear))].sort().reverse();
      setAcademicYears(uniqueYears);
      
      // Auto-select the latest academic year
      if (uniqueYears.length > 0) {
        setSelectedAcademicYear(uniqueYears[0]);
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      setError('Không thể tải danh sách năm học');
    }
  };

  const fetchCoefficients = async () => {
    if (!selectedAcademicYear) return;
    
    setLoading(true);
    setError(null);
    setPendingChanges({});
    try {
      const response = await TeacherCoefficientAPI.getByAcademicYear(selectedAcademicYear);
      setCoefficients(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teacher coefficients:', err);
      setError('Không thể tải dữ liệu hệ số giáo viên. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoefficientChange = (degreeId, newValue) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue) || numValue <= 0) return;
    
    setPendingChanges(prev => ({
      ...prev,
      [degreeId]: numValue
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có thay đổi nào để lưu',
        severity: 'info'
      });
      return;
    }

    setSaving(true);
    try {
      const coefficientsToUpdate = Object.entries(pendingChanges).map(([degreeId, coefficient]) => ({
        degreeId,
        coefficient
      }));

      await TeacherCoefficientAPI.batchUpdate({
        academicYear: selectedAcademicYear,
        coefficients: coefficientsToUpdate
      });

      setSnackbar({
        open: true,
        message: 'Cập nhật hệ số giáo viên thành công!',
        severity: 'success'
      });
      
      setPendingChanges({});
      fetchCoefficients();
    } catch (error) {
      console.error('Failed to save teacher coefficients:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật hệ số giáo viên';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentValue = (degree) => {
    if (pendingChanges[degree.id] !== undefined) {
      return pendingChanges[degree.id];
    }
    return degree.coefficient;
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (loading && coefficients.length === 0) {
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
              <TrendingUpIcon color="primary" />
              <Typography variant="h5" component="h1">
                Hệ số giáo viên
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchCoefficients}
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
            Thiết lập hệ số áp dụng cho giáo viên dựa trên bằng cấp theo từng năm học. 
            Hệ số này được sử dụng để điều chỉnh tiền dạy theo trình độ học vấn.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {hasChanges && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Bạn có {Object.keys(pendingChanges).length} thay đổi chưa lưu. 
              Nhấn "Lưu thay đổi" để áp dụng.
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
          </Grid>

          {selectedAcademicYear && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>STT</strong></TableCell>
                    <TableCell><strong>Bằng cấp</strong></TableCell>
                    <TableCell><strong>Tên viết tắt</strong></TableCell>
                    <TableCell><strong>Hệ số</strong></TableCell>
                    <TableCell><strong>Trạng thái</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : coefficients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Không có dữ liệu hệ số cho năm học này.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    coefficients.map((coefficient, index) => {
                      const degree = coefficient.degree;
                      const currentValue = getCurrentValue(coefficient);
                      const hasChange = pendingChanges[degree.id] !== undefined;
                      const isNewRecord = !coefficient.id; // Default values not saved yet
                      
                      return (
                        <TableRow key={degree.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{degree.fullName}</TableCell>
                          <TableCell>
                            <Chip label={degree.shortName} size="small" />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={currentValue}
                              onChange={(e) => handleCoefficientChange(degree.id, e.target.value)}
                              size="small"
                              inputProps={{ 
                                min: 0.1, 
                                max: 5.0, 
                                step: 0.1,
                                style: { 
                                  textAlign: 'center',
                                  backgroundColor: hasChange ? '#fff3e0' : 'transparent'
                                }
                              }}
                              disabled={saving}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            {isNewRecord ? (
                              <Chip label="Mặc định" color="default" size="small" />
                            ) : hasChange ? (
                              <Chip label="Đã sửa" color="warning" size="small" />
                            ) : (
                              <Chip label="Đã lưu" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!selectedAcademicYear && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Vui lòng chọn năm học để xem và chỉnh sửa hệ số giáo viên.
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

export default TeacherCoefficientsPage; 