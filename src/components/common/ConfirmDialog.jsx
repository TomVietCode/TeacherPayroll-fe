import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  content = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  severity = 'warning' // 'warning', 'error', 'info'
}) => {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const getButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} color={getButtonColor()} variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
