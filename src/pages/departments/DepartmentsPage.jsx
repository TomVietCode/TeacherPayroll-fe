import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { DepartmentAPI } from '../../services/api';
import DepartmentFormDialog from '../../components/departments/DepartmentFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DepartmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Không thể tải dữ liệu khoa/bộ môn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const columns = [
    { id: 'shortName', label: 'Tên viết tắt', width: '20%' },
    { id: 'fullName', label: 'Tên khoa', width: '60%' },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '20%',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }
  ];

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setFormOpen(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setFormOpen(true);
  };

  const handleDeleteDepartment = (department) => {
    setSelectedDepartment(department);
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
      if (selectedDepartment) {
        // Edit existing department
        await DepartmentAPI.update(selectedDepartment.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật khoa thành công',
          severity: 'success'
        });
      } else {
        // Add new department
        await DepartmentAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm khoa mới thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchDepartments();
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
    if (!selectedDepartment) return;
    
    try {
      await DepartmentAPI.delete(selectedDepartment.id);
      fetchDepartments();
      setSnackbar({
        open: true,
        message: 'Xóa khoa thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting department:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa khoa. Vui lòng thử lại.';
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
    <Box sx={{ height: '100%', width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        data={departments}
        loading={loading}
        onAdd={handleAddDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />

      <DepartmentFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedDepartment}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa khoa"
        content={`Bạn có chắc chắn muốn xóa khoa "${selectedDepartment?.fullName || ''}" không?`}
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

export default DepartmentsPage;
