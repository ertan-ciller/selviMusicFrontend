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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { pricingAPI, studentAPI, Pricing, Student } from '../services/api';

const PricingPage: React.FC = () => {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    studentId: '',
    lessonPrice: '',
    monthlyPrice: '',
    discountPercentage: '0',
    paymentMethod: 'CASH' as Pricing['paymentMethod'],
    paymentDay: '1',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pricingsResponse, studentsResponse] = await Promise.all([
        pricingAPI.getAll(),
        studentAPI.getAll(),
      ]);
      setPricings(pricingsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      showSnackbar('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pricing?: Pricing) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        studentId: pricing.studentId.toString(),
        lessonPrice: pricing.lessonPrice.toString(),
        monthlyPrice: pricing.monthlyPrice.toString(),
        discountPercentage: pricing.discountPercentage.toString(),
        paymentMethod: pricing.paymentMethod,
        paymentDay: pricing.paymentDay.toString(),
        notes: pricing.notes || '',
        isActive: pricing.isActive,
      });
    } else {
      setEditingPricing(null);
      setFormData({
        studentId: '',
        lessonPrice: '',
        monthlyPrice: '',
        discountPercentage: '0',
        paymentMethod: 'CASH',
        paymentDay: '1',
        notes: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPricing(null);
  };

  const handleSubmit = async () => {
    try {
      const pricingData: Pricing = {
        studentId: parseInt(formData.studentId),
        lessonPrice: parseFloat(formData.lessonPrice),
        monthlyPrice: parseFloat(formData.monthlyPrice),
        discountPercentage: parseFloat(formData.discountPercentage),
        paymentMethod: formData.paymentMethod,
        paymentDay: parseInt(formData.paymentDay),
        notes: formData.notes,
        isActive: formData.isActive,
      };

      if (editingPricing) {
        await pricingAPI.update(editingPricing.id!, pricingData);
        showSnackbar('Ücretlendirme başarıyla güncellendi');
      } else {
        await pricingAPI.create(pricingData);
        showSnackbar('Ücretlendirme başarıyla oluşturuldu');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      showSnackbar('Ücretlendirme kaydedilirken hata oluştu', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ücretlendirmeyi silmek istediğinizden emin misiniz?')) {
      try {
        await pricingAPI.delete(id);
        showSnackbar('Ücretlendirme başarıyla silindi');
        loadData();
      } catch (error) {
        showSnackbar('Ücretlendirme silinirken hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getPaymentMethodLabel = (method: Pricing['paymentMethod']) => {
    const labels = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale/EFT',
      CHECK: 'Çek',
    };
    return labels[method];
  };

  const getPaymentMethodColor = (method: Pricing['paymentMethod']) => {
    const colors = {
      CASH: 'success',
      CREDIT_CARD: 'primary',
      BANK_TRANSFER: 'info',
      CHECK: 'warning',
    };
    return colors[method];
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Bilinmeyen Öğrenci';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ücretlendirme Yönetimi
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Ücretlendirme Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Öğrenci</TableCell>
              <TableCell>Ders Ücreti</TableCell>
              <TableCell>Aylık Ücret</TableCell>
              <TableCell>İndirim</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell>Ödeme Günü</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : pricings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Ücretlendirme bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              pricings.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {getStudentName(pricing.studentId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {pricing.lessonPrice.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </TableCell>
                  <TableCell>
                    {pricing.monthlyPrice.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`%${pricing.discountPercentage}`}
                      color={pricing.discountPercentage > 0 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodLabel(pricing.paymentMethod)}
                      color={getPaymentMethodColor(pricing.paymentMethod) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {pricing.paymentDay}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pricing.isActive ? 'Aktif' : 'Pasif'}
                      color={pricing.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(pricing)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(pricing.id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ücretlendirme Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPricing ? 'Ücretlendirme Düzenle' : 'Yeni Ücretlendirme Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={students.find(s => s.id === parseInt(formData.studentId)) || null}
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  studentId: newValue?.id?.toString() || '',
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Öğrenci"
                  required
                  error={!formData.studentId}
                  helperText={!formData.studentId ? 'Öğrenci seçiniz' : ''}
                />
              )}
              disabled={!!editingPricing} // Düzenleme sırasında öğrenci değiştirilemez
            />

            <TextField
              label="Ders Ücreti"
              fullWidth
              type="number"
              value={formData.lessonPrice}
              onChange={(e) => setFormData({ ...formData, lessonPrice: e.target.value })}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Aylık Ücret"
              fullWidth
              type="number"
              value={formData.monthlyPrice}
              onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="İndirim Yüzdesi"
              fullWidth
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />

            <FormControl fullWidth>
              <InputLabel>Ödeme Yöntemi</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Ödeme Yöntemi"
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as Pricing['paymentMethod'] })}
              >
                <MenuItem value="CASH">Nakit</MenuItem>
                <MenuItem value="CREDIT_CARD">Kredi Kartı</MenuItem>
                <MenuItem value="BANK_TRANSFER">Havale/EFT</MenuItem>
                <MenuItem value="CHECK">Çek</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Ödeme Günü"
              fullWidth
              type="number"
              value={formData.paymentDay}
              onChange={(e) => setFormData({ ...formData, paymentDay: e.target.value })}
              inputProps={{ min: 1, max: 31 }}
              helperText="Ayın kaçında ödeme alınacak"
            />

            <TextField
              label="Notlar"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.studentId || !formData.lessonPrice || !formData.monthlyPrice}
          >
            {editingPricing ? 'Güncelle' : 'Ekle'}
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

export default PricingPage; 