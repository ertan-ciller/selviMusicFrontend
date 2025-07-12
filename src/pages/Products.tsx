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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { productAPI, Product } from '../services/api';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Product['category'] | 'ALL'>('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'INSTRUMENT' as Product['category'],
    price: '',
    stockQuantity: '',
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      showSnackbar('Ürünler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productAPI.search(searchKeyword);
      setProducts(response.data);
    } catch (error) {
      showSnackbar('Arama yapılırken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async () => {
    if (selectedCategory === 'ALL') {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productAPI.getByCategory(selectedCategory);
      setProducts(response.data);
    } catch (error) {
      showSnackbar('Kategori filtresi uygulanırken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity?.toString() || '',
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: 'INSTRUMENT',
        price: '',
        stockQuantity: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSubmit = async () => {
    try {
      const productData: Product = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
        isActive: formData.isActive,
      };

      if (editingProduct) {
        await productAPI.update(editingProduct.id!, productData);
        showSnackbar('Ürün başarıyla güncellendi');
      } else {
        await productAPI.create(productData);
        showSnackbar('Ürün başarıyla oluşturuldu');
      }

      handleCloseDialog();
      loadProducts();
    } catch (error) {
      showSnackbar('Ürün kaydedilirken hata oluştu', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await productAPI.delete(id);
        showSnackbar('Ürün başarıyla silindi');
        loadProducts();
      } catch (error) {
        showSnackbar('Ürün silinirken hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getCategoryColor = (category: Product['category']) => {
    const colors = {
      INSTRUMENT: 'primary',
      ACCESSORY: 'secondary',
      BOOK: 'success',
      EQUIPMENT: 'warning',
      OTHER: 'default',
    };
    return colors[category];
  };

  const getCategoryLabel = (category: Product['category']) => {
    const labels = {
      INSTRUMENT: 'Enstrüman',
      ACCESSORY: 'Aksesuar',
      BOOK: 'Kitap',
      EQUIPMENT: 'Ekipman',
      OTHER: 'Diğer',
    };
    return labels[category];
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ürün Yönetimi
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

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Ürün Ara"
            variant="outlined"
            size="small"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Ara
          </Button>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={selectedCategory}
              label="Kategori"
              onChange={(e) => setSelectedCategory(e.target.value as Product['category'] | 'ALL')}
            >
              <MenuItem value="ALL">Tümü</MenuItem>
              <MenuItem value="INSTRUMENT">Enstrüman</MenuItem>
              <MenuItem value="ACCESSORY">Aksesuar</MenuItem>
              <MenuItem value="BOOK">Kitap</MenuItem>
              <MenuItem value="EQUIPMENT">Ekipman</MenuItem>
              <MenuItem value="OTHER">Diğer</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleCategoryFilter}
          >
            Filtrele
          </Button>

          <Button
            variant="outlined"
            onClick={loadProducts}
          >
            Yenile
          </Button>
        </Box>
      </Paper>

      {/* Ürün Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Fiyat</TableCell>
              <TableCell>Stok</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Ürün bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{product.name}</Typography>
                      {product.description && (
                        <Typography variant="caption" color="textSecondary">
                          {product.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(product.category)}
                      color={getCategoryColor(product.category) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {product.price.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.stockQuantity || 0}
                      color={product.stockQuantity && product.stockQuantity < 10 ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? 'Aktif' : 'Pasif'}
                      color={product.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id!)}
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

      {/* Ürün Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Ürün Adı"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              label="Açıklama"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label="Kategori"
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
              >
                <MenuItem value="INSTRUMENT">Enstrüman</MenuItem>
                <MenuItem value="ACCESSORY">Aksesuar</MenuItem>
                <MenuItem value="BOOK">Kitap</MenuItem>
                <MenuItem value="EQUIPMENT">Ekipman</MenuItem>
                <MenuItem value="OTHER">Diğer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Fiyat"
              fullWidth
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Stok Miktarı"
              fullWidth
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Güncelle' : 'Ekle'}
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

export default Products; 