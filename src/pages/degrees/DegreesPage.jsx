import { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
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
      setDegrees(response.data.data || []);
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
    { id: 'shortName', label: 'Tên viết tắt', width: '20%' },
    { id: 'fullName', label: 'Tên bằng cấp', width: '60%' },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '20%',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }
  ];

  const handleAddDegree = () => {
    // To be implemented
  };

  const handleEditDegree = () => {
    // To be implemented
  };

  const handleDeleteDegree = () => {
    // To be implemented
  };

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        data={degrees}
        loading={loading}
        onAdd={handleAddDegree}
        onEdit={handleEditDegree}
        onDelete={handleDeleteDegree}
      />
    </Box>
  );
};

export default DegreesPage;
