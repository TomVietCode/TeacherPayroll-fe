import { useState, useEffect } from 'react';
import { Typography, Box, Alert, Grid, Card, CardContent } from '@mui/material';
import { StatisticsAPI } from '../../services/api';

const StatisticsPage = () => {
  const [statsByDepartment, setStatsByDepartment] = useState([]);
  const [statsByDegree, setStatsByDegree] = useState([]);
  const [statsByAge, setStatsByAge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [departmentResponse, degreeResponse, ageResponse] = await Promise.all([
        StatisticsAPI.byDepartment(),
        StatisticsAPI.byDegree(),
        StatisticsAPI.byAge()
      ]);
      
      setStatsByDepartment(departmentResponse.data);
      setStatsByDegree(degreeResponse.data);
      setStatsByAge(ageResponse.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Thống Kê
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : (
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê theo khoa/bộ môn
                </Typography>
                {/* Chart sẽ được thêm vào sau */}
                <Typography variant="body2" color="text.secondary">
                  Biểu đồ sẽ được bổ sung sau
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê theo bằng cấp
                </Typography>
                {/* Chart sẽ được thêm vào sau */}
                <Typography variant="body2" color="text.secondary">
                  Biểu đồ sẽ được bổ sung sau
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê theo độ tuổi
                </Typography>
                {/* Chart sẽ được thêm vào sau */}
                <Typography variant="body2" color="text.secondary">
                  Biểu đồ sẽ được bổ sung sau
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default StatisticsPage;
