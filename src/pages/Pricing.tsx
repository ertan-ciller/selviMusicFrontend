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
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  MusicNote as MusicIcon,
} from '@mui/icons-material';
import { lessonPricingAPI, lessonTypeAPI, LessonPricing, LessonType, CreateLessonPricingRequest } from '../services/api';

const PricingPage: React.FC = () => {
  const [lessonPricings, setLessonPricings] = useState<LessonPricing[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPricing, setEditingPricing] = useState<LessonPricing | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState<CreateLessonPricingRequest>({
    lessonTypeId: 0,
    studentPrice: 0,
    teacherCommission: 0,
    musicSchoolShare: 0,
    effectiveFrom: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    effectiveTo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pricingsResponse, typesResponse] = await Promise.all([
        lessonPricingAPI.getAll(),
        lessonTypeAPI.getActive(),
      ]);
      setLessonPricings(pricingsResponse.data);
      setLessonTypes(typesResponse.data);
    } catch (error) {
      showSnackbar('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pricing?: LessonPricing) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        lessonTypeId: pricing.lessonTypeId,
        studentPrice: pricing.studentPrice,
        teacherCommission: pricing.teacherCommission,
        musicSchoolShare: pricing.musicSchoolShare,
        effectiveFrom: pricing.effectiveFrom.slice(0, 16),
        effectiveTo: pricing.effectiveTo ? pricing.effectiveTo.slice(0, 16) : '',
      });
    } else {
      setEditingPricing(null);
      setFormData({
        lessonTypeId: 0,
        studentPrice: 0,
        teacherCommission: 0,
        musicSchoolShare: 0,
        effectiveFrom: new Date().toISOString().slice(0, 16),
        effectiveTo: '',
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
      if (editingPricing) {
        await lessonPricingAPI.update(editingPricing.id!, formData);
        showSnackbar('Ders ücretlendirmesi başarıyla güncellendi');
      } else {
        await lessonPricingAPI.create(formData);
        showSnackbar('Ders ücretlendirmesi başarıyla oluşturuldu');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      showSnackbar('Ders ücretlendirmesi kaydedilirken hata oluştu', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ders ücretlendirmesini silmek istediğinizden emin misiniz?')) {
      try {
        await lessonPricingAPI.delete(id);
        showSnackbar('Ders ücretlendirmesi başarıyla silindi');
        loadData();
      } catch (error) {
        showSnackbar('Ders ücretlendirmesi silinirken hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getLessonTypeName = (lessonTypeId: number): string => {
    const lessonType = lessonTypes.find(lt => lt.id === lessonTypeId);
    return lessonType ? lessonType.name : 'Bilinmeyen Ders Türü';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isFormValid = () => {
    return formData.lessonTypeId > 0 && 
           formData.studentPrice > 0 && 
           formData.teacherCommission > 0 && 
           formData.musicSchoolShare > 0 &&
           formData.effectiveFrom;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <MusicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ders Ücretlendirme Yönetimi
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

      {/* Ders Ücretlendirme Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ders Türü</TableCell>
              <TableCell>Öğrenci Ücreti</TableCell>
              <TableCell>Öğretmen Komisyonu</TableCell>
              <TableCell>Müzik Okulu Payı</TableCell>
              <TableCell>Geçerlilik Başlangıcı</TableCell>
              <TableCell>Geçerlilik Bitişi</TableCell>
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
            ) : lessonPricings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Ders ücretlendirmesi bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              lessonPricings.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {getLessonTypeName(pricing.lessonTypeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(pricing.studentPrice)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(pricing.teacherCommission)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(pricing.musicSchoolShare)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(pricing.effectiveFrom)}
                  </TableCell>
                  <TableCell>
                    {pricing.effectiveTo ? formatDateTime(pricing.effectiveTo) : 'Süresiz'}
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

      {/* Ders Ücretlendirme Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPricing ? 'Ders Ücretlendirmesi Düzenle' : 'Yeni Ders Ücretlendirmesi Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Autocomplete
              options={lessonTypes}
              getOptionLabel={(option) => option.name}
              value={lessonTypes.find(lt => lt.id === formData.lessonTypeId) || null}
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  lessonTypeId: newValue?.id || 0,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ders Türü"
                  required
                  error={!formData.lessonTypeId}
                  helperText={!formData.lessonTypeId ? 'Ders türü seçiniz' : ''}
                />
              )}
              disabled={!!editingPricing} // Düzenleme sırasında ders türü değiştirilemez
            />

            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex={1} minWidth={300}>
                <TextField
                  label="Öğrenci Ücreti (₺)"
                  fullWidth
                  type="number"
                  value={formData.studentPrice}
                  onChange={(e) => setFormData({ ...formData, studentPrice: parseFloat(e.target.value) || 0 })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Öğrenciden alınacak ücret"
                />
              </Box>
              <Box flex={1} minWidth={300}>
                <TextField
                  label="Öğretmen Komisyonu (₺)"
                  fullWidth
                  type="number"
                  value={formData.teacherCommission}
                  onChange={(e) => setFormData({ ...formData, teacherCommission: parseFloat(e.target.value) || 0 })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Öğretmene ödenecek komisyon"
                />
              </Box>
              <Box flex={1} minWidth={300}>
                <TextField
                  label="Müzik Okulu Payı (₺)"
                  fullWidth
                  type="number"
                  value={formData.musicSchoolShare}
                  onChange={(e) => setFormData({ ...formData, musicSchoolShare: parseFloat(e.target.value) || 0 })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Müzik okulunun payı"
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex={1} minWidth={300}>
                <TextField
                  label="Geçerlilik Başlangıcı"
                  fullWidth
                  type="datetime-local"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Bu fiyatlandırmanın geçerli olmaya başlayacağı tarih"
                />
              </Box>
              <Box flex={1} minWidth={300}>
                <TextField
                  label="Geçerlilik Bitişi (Opsiyonel)"
                  fullWidth
                  type="datetime-local"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Bu fiyatlandırmanın geçerliliğinin biteceği tarih (boş bırakılabilir)"
                />
              </Box>
            </Box>

            {/* Toplam Kontrolü */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Toplam Kontrolü
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body2" color="textSecondary">
                      Öğrenci Ücreti: {formatCurrency(formData.studentPrice)}
                    </Typography>
                  </Box>
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body2" color="textSecondary">
                      Öğretmen Komisyonu: {formatCurrency(formData.teacherCommission)}
                    </Typography>
                  </Box>
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body2" color="textSecondary">
                      Müzik Okulu Payı: {formatCurrency(formData.musicSchoolShare)}
                    </Typography>
                  </Box>
                </Box>
                <Box mt={1}>
                  <Typography 
                    variant="body1" 
                    color={formData.studentPrice === (formData.teacherCommission + formData.musicSchoolShare) ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    Toplam: {formatCurrency(formData.teacherCommission + formData.musicSchoolShare)} 
                    {formData.studentPrice === (formData.teacherCommission + formData.musicSchoolShare) 
                      ? ' ✓' 
                      : ' (Öğrenci ücreti ile eşleşmiyor!)'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!isFormValid() || formData.studentPrice !== (formData.teacherCommission + formData.musicSchoolShare)}
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