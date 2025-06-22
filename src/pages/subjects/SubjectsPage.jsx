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
import { SubjectAPI, DepartmentAPI } from '../../services/api';
import SubjectFormDialog from '../../components/subjects/SubjectFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    departmentId: ''
  });

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SubjectAPI.getAll();
      const subjectData = response.data.data || [];
      setSubjects(subjectData);
      setFilteredSubjects(subjectData);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Không thể tải dữ liệu học phần. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  // Apply filters whenever filters or subjects change
  useEffect(() => {
    let filtered = subjects;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.name.toLowerCase().includes(searchLower) ||
        subject.code.toLowerCase().includes(searchLower) ||
        (subject.department?.fullName && subject.department.fullName.toLowerCase().includes(searchLower)) ||
        (subject.department?.shortName && subject.department.shortName.toLowerCase().includes(searchLower))
      );
    }

    // Apply department filter
    if (filters.departmentId) {
      filtered = filtered.filter(subject => subject.departmentId === filters.departmentId);
    }

    setFilteredSubjects(filtered);
  }, [subjects, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      departmentId: ''
    });
  };

  const columns = [
    { id: 'code', label: 'Mã', width: '15%' },
    { id: 'name', label: 'Tên', width: '30%' },
    { id: 'credits', label: 'Số tín chỉ', width: '10%' },
    { id: 'coefficient', label: 'Hệ số', width: '12%' },
    { id: 'totalPeriods', label: 'Số tiết', width: '10%' },
    { 
      id: 'department', 
      label: 'Khoa phụ trách', 
      width: '23%',
      render: (row) => row.department?.fullName || 'N/A'
    }
  ];

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setFormOpen(true);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormOpen(true);
  };

  const handleDeleteSubject = (subject) => {
    setSelectedSubject(subject);
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
      if (selectedSubject) {
        // Edit existing subject
        await SubjectAPI.update(selectedSubject.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật học phần thành công',
          severity: 'success'
        });
      } else {
        // Add new subject
        await SubjectAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm học phần mới thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchSubjects();
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
    if (!selectedSubject) return;
    
    try {
      await SubjectAPI.delete(selectedSubject.id);
      fetchSubjects();
      setSnackbar({
        open: true,
        message: 'Xóa học phần thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting subject:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa học phần. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
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
    <Box sx={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
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
                placeholder="Tìm kiếm học phần..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} width="25%">
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
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                disabled={!filters.search && !filters.departmentId}
                fullWidth
              >
                Xóa bộ lọc
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Hiển thị {filteredSubjects.length} / {subjects.length} học phần
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <CustomTable
        columns={columns}
        data={filteredSubjects}
        loading={loading}
        onAdd={handleAddSubject}
        onEdit={handleEditSubject}
        onDelete={handleDeleteSubject}
      />

      <SubjectFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedSubject}
        isSubmitting={isSubmitting}
        departments={departments}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa học phần"
        content={`Bạn có chắc chắn muốn xóa học phần "${selectedSubject?.name || ''}" không?`}
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

export default SubjectsPage; 