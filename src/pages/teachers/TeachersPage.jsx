import { useState, useEffect } from 'react';
import { 
  Box, 
  Alert, 
  Snackbar, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import CustomTable from '../../components/common/CustomTable';
import { TeacherAPI, DepartmentAPI, DegreeAPI } from '../../services/api';
import TeacherFormDialog from '../../components/teachers/TeacherFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    departmentId: '',
    degreeId: ''
  });

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TeacherAPI.getAll();
      const teacherData = response.data.data || [];
      setTeachers(teacherData);
      setFilteredTeachers(teacherData);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError('Không thể tải dữ liệu giáo viên. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [departmentsRes, degreesRes] = await Promise.all([
        DepartmentAPI.getAll(),
        DegreeAPI.getAll()
      ]);
      
      setDepartments(departmentsRes.data.data || []);
      setDegrees(degreesRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchFilterOptions();
  }, []);

  // Apply filters whenever filters or teachers change
  useEffect(() => {
    let filtered = teachers;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(teacher => 
        teacher.fullName.toLowerCase().includes(searchLower) ||
        teacher.code.toLowerCase().includes(searchLower) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchLower)) ||
        (teacher.phone && teacher.phone.includes(filters.search))
      );
    }

    // Apply department filter
    if (filters.departmentId) {
      filtered = filtered.filter(teacher => teacher.departmentId === filters.departmentId);
    }

    // Apply degree filter
    if (filters.degreeId) {
      filtered = filtered.filter(teacher => teacher.degreeId === filters.degreeId);
    }

    setFilteredTeachers(filtered);
  }, [teachers, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      departmentId: '',
      degreeId: ''
    });
  };

  const columns = [
    { id: 'code', label: 'Mã GV', width: '15%' },
    { id: 'fullName', label: 'Họ và tên', width: '25%' },
    { 
      id: 'dateOfBirth', 
      label: 'Ngày sinh',
      width: '15%',
      render: (row) => new Date(row.dateOfBirth).toLocaleDateString('vi-VN')
    },
    { 
      id: 'department',
      label: 'Khoa',
      width: '15%',
      render: (row) => row.department?.shortName || 'N/A'
    },
    { 
      id: 'degree',
      label: 'Bằng cấp',
      width: '15%',
      render: (row) => row.degree?.fullName || 'N/A'
    }
  ];

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setFormOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setFormOpen(true);
  };

  const handleDeleteTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setConfirmOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedTeacher) {
        // Edit existing teacher
        await TeacherAPI.update(selectedTeacher.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật giáo viên thành công',
          severity: 'success'
        });
      } else {
        // Add new teacher
        await TeacherAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm giáo viên thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;
    
    try {
      await TeacherAPI.delete(selectedTeacher.id);
      fetchTeachers();
      setSnackbar({
        open: true,
        message: 'Xóa giáo viên thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xóa giáo viên. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Bộ lọc và tìm kiếm
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm kiếm giáo viên"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} width={"20%"}>
              <FormControl fullWidth>
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={filters.departmentId}
                  onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                  label="Khoa"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                >
                  <MenuItem value="">Tất cả khoa</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} width={"20%"}>
              <FormControl fullWidth>
                <InputLabel>Bằng cấp</InputLabel>
                <Select
                  value={filters.degreeId}
                  onChange={(e) => handleFilterChange('degreeId', e.target.value)}
                  label="Bằng cấp"
                >
                  <MenuItem value="">Tất cả bằng cấp</MenuItem>
                  {degrees.map((degree) => (
                    <MenuItem key={degree.id} value={degree.id}>
                      {degree.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                fullWidth
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <CustomTable
        columns={columns}
        data={filteredTeachers}
        loading={loading}
        onAdd={handleAddTeacher}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
      />

      <TeacherFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedTeacher}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa giáo viên"
        content={`Bạn có chắc chắn muốn xóa giáo viên "${selectedTeacher?.fullName || ''}" không?`}
        confirmText="Xóa"
        severity="error"
      />

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

export default TeachersPage;
