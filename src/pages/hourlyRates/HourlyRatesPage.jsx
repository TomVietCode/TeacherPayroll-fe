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
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { HourlyRateAPI } from '../../services/api';
import HourlyRateFormDialog from '../../components/hourlyRates/HourlyRateFormDialog';

function HourlyRatesPage() {
  const [hourlyRates, setHourlyRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchHourlyRates();
  }, []);

  const fetchHourlyRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await HourlyRateAPI.getAll();
      setHourlyRates(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch hourly rates:', err);
      setError('Không thể tải dữ liệu định mức tiền. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await HourlyRateAPI.update(editingItem.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật định mức tiền thành công!',
          severity: 'success'
        });
      } else {
        await HourlyRateAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm định mức tiền thành công!',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchHourlyRates();
    } catch (error) {
      console.error('Failed to save hourly rate:', error);
      const errorMessage = error.response?.data?.message || 
        (editingItem ? 'Không thể cập nhật định mức tiền' : 'Không thể thêm định mức tiền');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    
    setSubmitting(true);
    try {
      await HourlyRateAPI.delete(deletingItem.id);
      setSnackbar({
        open: true,
        message: 'Xóa định mức tiền thành công!',
        severity: 'success'
      });
      setDeleteConfirmOpen(false);
      setDeletingItem(null);
      fetchHourlyRates();
    } catch (error) {
      console.error('Failed to delete hourly rate:', error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa định mức tiền';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="primary" />
              <Typography variant="h5" component="h1">
                Định mức tiền theo tiết
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={submitting}
            >
              Thêm định mức
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Quản lý định mức tiền cho một tiết giảng dạy theo từng năm học. 
            Đây là cơ sở để tính toán tiền dạy cho giáo viên.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>STT</strong></TableCell>
                  <TableCell><strong>Năm học</strong></TableCell>
                  <TableCell><strong>Số tiền theo tiết</strong></TableCell>
                  <TableCell><strong>Ngày thiết lập</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hourlyRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có định mức tiền nào được thiết lập.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  hourlyRates.map((rate, index) => (
                    <TableRow key={rate.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rate.academicYear} 
                          color="primary" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(rate.ratePerHour)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(rate.establishedDate)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(rate)}
                          color="primary"
                          disabled={submitting}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(rate)}
                          color="error"
                          disabled={submitting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <HourlyRateFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        loading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa định mức tiền cho năm học "{deletingItem?.academicYear}"?
            <br />
            <strong>Hành động này không thể hoàn tác.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default HourlyRatesPage; 