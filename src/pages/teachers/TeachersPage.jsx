import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { TeacherAPI } from '../../services/api';
import TeacherFormDialog from '../../components/teachers/TeacherFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
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

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TeacherAPI.getAll();
      setTeachers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError('Không thể tải dữ liệu giáo viên. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const columns = [
    { id: 'code', label: 'Mã GV', width: '15%' },
    { id: 'fullName', label: 'Họ và tên', width: '30%' },
    { 
      id: 'dateOfBirth', 
      label: 'Ngày sinh',
      width: '15%',
      render: (row) => new Date(row.dateOfBirth).toLocaleDateString('vi-VN')
    },
    { 
      id: 'department',
      label: 'Tên viết tắt',
      width: '20%',
      render: (row) => row.department?.shortName || 'N/A'
    },
    { 
      id: 'degree',
      label: 'Bằng cấp',
      width: '20%',
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
    <Box sx={{ height: '100%', width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        data={teachers}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
