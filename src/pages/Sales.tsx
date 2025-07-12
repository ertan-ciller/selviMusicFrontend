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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { saleAPI, productAPI, studentAPI, Sale, Product, Student, SaleItem } from '../services/api';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'CASH' as Sale['paymentMethod'],
    notes: '',
    items: [] as Array<{ productId: number; quantity: number; discountPercentage: number; product?: Product }>,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesResponse, productsResponse, studentsResponse] = await Promise.all([
        saleAPI.getAll(),
        productAPI.getAll(),
        studentAPI.getAll(),
      ]);
      setSales(salesResponse.data);
      setProducts(productsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      showSnackbar('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      paymentMethod: 'CASH',
      notes: '',
      items: [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: 0, quantity: 1, discountPercentage: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Ürün seçildiğinde ürün bilgilerini ekle
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index].product = product;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      
      const unitPrice = product.price;
      const discountAmount = unitPrice * (item.discountPercentage / 100);
      const finalPrice = unitPrice - discountAmount;
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // %18 KDV
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    try {
      const saleData: Sale = {
        customerId: formData.customerId ? parseInt(formData.customerId) : undefined,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        discountAmount: 0,
        totalAmount: calculateTotal(),
        status: 'COMPLETED',
        soldAt: new Date().toISOString(),
        saleNumber: '',
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discountPercentage: item.discountPercentage,
        })),
      };

      await saleAPI.create(saleData);
      showSnackbar('Satış başarıyla oluşturuldu');
      handleCloseDialog();
      loadData();
    } catch (error) {
      showSnackbar('Satış oluşturulurken hata oluştu', 'error');
    }
  };

  const handleCancelSale = async (id: number) => {
    if (window.confirm('Bu satışı iptal etmek istediğinizden emin misiniz?')) {
      try {
        await saleAPI.cancel(id);
        showSnackbar('Satış başarıyla iptal edildi');
        loadData();
      } catch (error) {
        showSnackbar('Satış iptal edilirken hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: Sale['status']) => {
    const colors = {
      PENDING: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'info',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Sale['status']) => {
    const labels = {
      PENDING: 'Beklemede',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
      REFUNDED: 'İade Edildi',
    };
    return labels[status];
  };

  const getPaymentMethodLabel = (method: Sale['paymentMethod']) => {
    const labels = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale/EFT',
      CHECK: 'Çek',
    };
    return labels[method];
  };

  const getCustomerName = (sale: Sale) => {
    if (sale.customerId) {
      const student = students.find(s => s.id === sale.customerId);
      return student ? `${student.firstName} ${student.lastName}` : 'Bilinmeyen Öğrenci';
    }
    return sale.customerName || 'Misafir Müşteri';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Satış Yönetimi
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenDialog}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Satış Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Satış No</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Toplam Tutar</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Satış bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontFamily="monospace">
                      {sale.saleNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {getCustomerName(sale)}
                    </Typography>
                    {sale.customerPhone && (
                      <Typography variant="caption" color="textSecondary">
                        {sale.customerPhone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {sale.totalAmount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodLabel(sale.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(sale.status)}
                      color={getStatusColor(sale.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(sale.soldAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    {sale.status === 'COMPLETED' && (
                      <Tooltip title="Satışı İptal Et">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelSale(sale.id!)}
                        >
                          <CancelIcon />
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

      {/* Satış Ekleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1 }} />
            Yeni Satış
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* Müşteri Bilgileri */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Müşteri Bilgileri
                </Typography>
                
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  value={students.find(s => s.id === parseInt(formData.customerId)) || null}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      customerId: newValue?.id?.toString() || '',
                      customerName: newValue ? `${newValue.firstName} ${newValue.lastName}` : '',
                      customerPhone: newValue?.phoneNumber || '',
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Öğrenci Seç (Opsiyonel)"
                      fullWidth
                      margin="normal"
                    />
                  )}
                />

                <TextField
                  label="Müşteri Adı"
                  fullWidth
                  margin="normal"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />

                <TextField
                  label="Telefon"
                  fullWidth
                  margin="normal"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Ödeme Yöntemi</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Ödeme Yöntemi"
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as Sale['paymentMethod'] })}
                  >
                    <MenuItem value="CASH">Nakit</MenuItem>
                    <MenuItem value="CREDIT_CARD">Kredi Kartı</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Havale/EFT</MenuItem>
                    <MenuItem value="CHECK">Çek</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Notlar"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Box>

              {/* Ürün Listesi */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Ürünler
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddItem}
                    startIcon={<AddIcon />}
                  >
                    Ürün Ekle
                  </Button>
                </Box>

                <List>
                  {formData.items.map((item, index) => (
                    <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={
                          <Box>
                            <Autocomplete
                              options={products}
                              getOptionLabel={(option) => `${option.name} - ${option.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                              value={products.find(p => p.id === item.productId) || null}
                              onChange={(_, newValue) => {
                                handleItemChange(index, 'productId', newValue?.id || 0);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Ürün"
                                  size="small"
                                  required
                                />
                              )}
                            />
                            <Box display="flex" gap={1} mt={1}>
                              <TextField
                                label="Miktar"
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1 }}
                                sx={{ width: 100 }}
                              />
                              <TextField
                                label="İndirim %"
                                type="number"
                                size="small"
                                value={item.discountPercentage}
                                onChange={(e) => handleItemChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                sx={{ width: 120 }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveItem(index)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {formData.items.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Henüz ürün eklenmedi
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Toplam Bilgileri */}
            {formData.items.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Toplam</Typography>
                  <Box textAlign="right">
                    <Typography variant="body2">
                      Ara Toplam: {calculateSubtotal().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                    <Typography variant="body2">
                      KDV (%18): {calculateTax().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Genel Toplam: {calculateTotal().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={formData.items.length === 0 || formData.items.some(item => item.productId === 0)}
          >
            Satışı Tamamla
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

export default Sales; 