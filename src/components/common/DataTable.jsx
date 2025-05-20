import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DataTable = ({ 
  title, 
  columns = [], 
  data = [], 
  onAdd, 
  onEdit, 
  onDelete,
  loading = false,
  pagination = true,
  addButtonLabel = "Thêm mới"
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayData = pagination 
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : data;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        {onAdd && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  width={column.width}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell align="right" width="100px">Thao tác</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.id}`} align={column.align || 'left'}>
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      {onEdit && (
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => onEdit(row)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => onDelete(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
        />
      )}
    </Paper>
  );
};

export default DataTable;
