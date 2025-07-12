import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Autocomplete,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { lessonPaymentAPI, studentAPI, LessonPayment, Student } from '../services/api';

const LessonPayments: React.FC = () => {
  const [payments, setPayments] = useState<LessonPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    paymentPeriod: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, studentsResponse] = await Promise.all([
        lessonPaymentAPI.getAll(),
        studentAPI.getAll(),
      ]);
      setPayments(paymentsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      showSnackbar('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ paymentPeriod: '' });
    setSelectedStudent(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreatePayment = async () => {
    if (!selectedStudent || !formData.paymentPeriod) {
      showSnackbar('Öğrenci ve ödeme dönemi seçiniz', 'error');
      return;
    }

    try {
      await lessonPaymentAPI.createMonthlyPayment(selectedStudent.id!, formData.paymentPeriod);
      showSnackbar('Aylık ödeme başarıyla oluşturuldu');
      handleCloseDialog();
      loadData();
    } catch (error) {
      showSnackbar('Ödeme oluşturulurken hata oluştu', 'error');
    }
  };

  const handlePayPayment = async (paymentId: number) => {
    try {
      await lessonPaymentAPI.payMonthlyPayment(paymentId);
      showSnackbar('Ödeme başarıyla yapıldı');
      loadData();
    } catch (error) {
      showSnackbar('Ödeme yapılırken hata oluştu', 'error');
    }
  };

  const handleMarkOverdue = async () => {
    try {
      await lessonPaymentAPI.markOverdue();
      showSnackbar('Gecikmiş ödemeler işaretlendi');
      loadData();
    } catch (error) {
      showSnackbar('Gecikmiş ödemeler işaretlenirken hata oluştu', 'error');
    }
  };

  const handleGenerateMonthlyPayments = async (paymentPeriod: string) => {
    if (window.confirm(`Tüm öğrenciler için ${paymentPeriod} dönemi ödemelerini oluşturmak istediğinizden emin misiniz?`)) {
      try {
        await lessonPaymentAPI.generateMonthlyForAll(paymentPeriod);
        showSnackbar('Tüm öğrenciler için aylık ödemeler oluşturuldu');
        loadData();
      } catch (error) {
        showSnackbar('Aylık ödemeler oluşturulurken hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: LessonPayment['status']) => {
    const colors = {
      PENDING: 'warning',
      PAID: 'success',
      OVERDUE: 'error',
      CANCELLED: 'default',
    };
    return colors[status];
  };

  const getStatusLabel = (status: LessonPayment['status']) => {
    const labels = {
      PENDING: 'Beklemede',
      PAID: 'Ödendi',
      OVERDUE: 'Gecikmiş',
      CANCELLED: 'İptal Edildi',
    };
    return labels[status];
  };

  const getPaymentMethodLabel = (method: LessonPayment['paymentMethod']) => {
    const labels = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale/EFT',
      CHECK: 'Çek',
    };
    return labels[method];
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Bilinmeyen Öğrenci';
  };

  const getOverdueCount = () => {
    return payments.filter(p => p.status === 'OVERDUE').length;
  };

  const getPendingCount = () => {
    return payments.filter(p => p.status === 'PENDING').length;
  };

  const getPaidCount = () => {
    return payments.filter(p => p.status === 'PAID').length;
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + payment.finalAmount, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ders Ödemeleri
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={handleMarkOverdue}
            startIcon={<WarningIcon />}
          >
            Gecikmişleri İşaretle
          </Button>
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpenDialog}
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Toplam Ödeme
              </Typography>
              <Typography variant="h4" component="div">
                {getTotalAmount().toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Bekleyen Ödemeler
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {getPendingCount()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ödenen Ödemeler
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {getPaidCount()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gecikmiş Ödemeler
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {getOverdueCount()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Hızlı İşlemler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hızlı İşlemler
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={() => handleGenerateMonthlyPayments('2024-01')}
            startIcon={<ScheduleIcon />}
          >
            Ocak 2024 Ödemeleri Oluştur
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleGenerateMonthlyPayments('2024-02')}
            startIcon={<ScheduleIcon />}
          >
            Şubat 2024 Ödemeleri Oluştur
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleGenerateMonthlyPayments('2024-03')}
            startIcon={<ScheduleIcon />}
          >
            Mart 2024 Ödemeleri Oluştur
          </Button>
        </Box>
      </Paper>

      {/* Ödemeler Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Öğrenci</TableCell>
              <TableCell>Ödeme Dönemi</TableCell>
              <TableCell>Ödeme Tarihi</TableCell>
              <TableCell>Tutar</TableCell>
              <TableCell>İndirim</TableCell>
              <TableCell>Final Tutar</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Ödeme bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {getStudentName(payment.studentId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {payment.paymentPeriod}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    {payment.amount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </TableCell>
                  <TableCell>
                    {payment.discountAmount > 0 ? (
                      <Chip
                        label={`-${payment.discountAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                        color="success"
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {payment.finalAmount.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodLabel(payment.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(payment.status)}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payment.status === 'PENDING' && (
                      <Tooltip title="Ödeme Yap">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePayPayment(payment.id!)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ödeme Oluşturma Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1 }} />
            Aylık Ödeme Oluştur
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Öğrenci"
                  required
                  error={!selectedStudent}
                  helperText={!selectedStudent ? 'Öğrenci seçiniz' : ''}
                />
              )}
            />

            <TextField
              label="Ödeme Dönemi"
              fullWidth
              value={formData.paymentPeriod}
              onChange={(e) => setFormData({ ...formData, paymentPeriod: e.target.value })}
              required
              placeholder="YYYY-MM (örn: 2024-01)"
              helperText="Ödeme dönemini YYYY-MM formatında giriniz"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleCreatePayment} 
            variant="contained"
            disabled={!selectedStudent || !formData.paymentPeriod}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LessonPayments; 