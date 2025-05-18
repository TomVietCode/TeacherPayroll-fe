import { useState, useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { DegreeAPI } from '../../services/api';

const DegreesPage = () => {
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDegrees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DegreeAPI.getAll();
      setDegrees(response.data);
    } catch (err) {
      console.error('Failed to fetch degrees:', err);
      setError('Không thể tải dữ liệu bằng cấp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDegrees();
  }, []);

  const columns = [
    { id: 'code', label: 'Mã bằng cấp', width: '15%' },
    { id: 'name', label: 'Tên bằng cấp', width: '45%' },
    { 
      id: 'salaryCoefficient', 
      label: 'Hệ số lương', 
      align: 'right',
      width: '20%',
      render: (row) => row.salaryCoefficient.toFixed(2)
    },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '20%',
      render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN')
    }
  ];

  const handleAddDegree = () => {
    // To be implemented
  };

  const handleEditDegree = (degree) => {
    // To be implemented
  };

  const handleDeleteDegree = (degree) => {
    // To be implemented
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Bằng Cấp
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mt={3}>
        <DataTable
          title="Danh sách bằng cấp"
          columns={columns}
          data={degrees}
          loading={loading}
          onAdd={handleAddDegree}
          onEdit={handleEditDegree}
          onDelete={handleDeleteDegree}
        />
      </Box>
    </>
  );
};

export default DegreesPage;
