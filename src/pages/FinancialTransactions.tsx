import React, { useState, useEffect } from 'react';
import {
  financialTransactionAPI,
  FinancialTransaction,
  CreateFinancialTransactionRequest,
} from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

const FinancialTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netIncome, setNetIncome] = useState(0);

  const [formData, setFormData] = useState<CreateFinancialTransactionRequest>({
    transactionDate: new Date().toISOString(),
    amount: 0,
    transactionType: 'INCOME',
    category: 'OTHER_INCOME',
    description: '',
    paymentMethod: 'CASH',
    notes: '',
  });

  const transactionCategories = {
    INCOME: [
      'LESSON_INCOME',
      'PRODUCT_SALE',
      'MONTHLY_PAYMENT',
      'OTHER_INCOME',
    ],
    EXPENSE: [
      'TEACHER_COMMISSION',
      'RENT',
      'UTILITIES',
      'EQUIPMENT',
      'MAINTENANCE',
      'SALARY',
      'MARKETING',
      'OTHER_EXPENSE',
    ],
  };

  const categoryLabels: { [key: string]: string } = {
    LESSON_INCOME: 'Ders Geliri',
    PRODUCT_SALE: 'Ürün Satışı',
    MONTHLY_PAYMENT: 'Aylık Ödeme',
    OTHER_INCOME: 'Diğer Gelir',
    TEACHER_COMMISSION: 'Öğretmen Komisyonu',
    RENT: 'Kira',
    UTILITIES: 'Faturalar',
    EQUIPMENT: 'Ekipman',
    MAINTENANCE: 'Bakım',
    SALARY: 'Maaş',
    MARKETING: 'Pazarlama',
    OTHER_EXPENSE: 'Diğer Gider',
  };

  const paymentMethodLabels: { [key: string]: string } = {
    CASH: 'Nakit',
    CREDIT_CARD: 'Kredi Kartı',
    BANK_TRANSFER: 'Havale/EFT',
    CHECK: 'Çek',
  };

  useEffect(() => {
    loadTransactions();
    loadReports();
  }, [startDate, endDate]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (startDate && endDate) {
        const response = await financialTransactionAPI.getByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );
        setTransactions(response.data);
      } else {
        const response = await financialTransactionAPI.getAll();
        setTransactions(response.data);
      }
    } catch (err) {
      setError('İşlemler yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      if (startDate && endDate) {
        const [incomeRes, expenseRes, netRes] = await Promise.all([
          financialTransactionAPI.getTotalIncome(startDate.toISOString(), endDate.toISOString()),
          financialTransactionAPI.getTotalExpense(startDate.toISOString(), endDate.toISOString()),
          financialTransactionAPI.getNetIncome(startDate.toISOString(), endDate.toISOString()),
        ]);
        setTotalIncome(incomeRes.data);
        setTotalExpense(expenseRes.data);
        setNetIncome(netRes.data);
      }
    } catch (err) {
      console.error('Raporlar yüklenirken hata:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        await financialTransactionAPI.update(editingTransaction.id!, formData);
      } else {
        await financialTransactionAPI.create(formData);
      }
      setOpenDialog(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();
      loadReports();
    } catch (err) {
      setError('İşlem kaydedilirken hata oluştu');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      try {
        await financialTransactionAPI.delete(id);
        loadTransactions();
        loadReports();
      } catch (err) {
        setError('İşlem silinirken hata oluştu');
        console.error(err);
      }
    }
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      category: transaction.category,
      description: transaction.description,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType,
      studentId: transaction.studentId,
      teacherId: transaction.teacherId,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      transactionDate: new Date().toISOString(),
      amount: 0,
      transactionType: 'INCOME',
      category: 'OTHER_INCOME',
      description: '',
      paymentMethod: 'CASH',
      notes: '',
    });
  };

  const handleOpenDialog = () => {
    setEditingTransaction(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    resetForm();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Gelir-Gider İşlemleri
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Özet Kartları */}
        <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Toplam Gelir
              </Typography>
              <Typography variant="h5" color="success.main">
                ₺{totalIncome.toLocaleString('tr-TR')}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Toplam Gider
              </Typography>
              <Typography variant="h5" color="error.main">
                ₺{totalExpense.toLocaleString('tr-TR')}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Gelir
              </Typography>
              <Typography variant="h5" color={netIncome >= 0 ? 'success.main' : 'error.main'}>
                ₺{netIncome.toLocaleString('tr-TR')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tarih Filtreleri */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <DatePicker
            label="Başlangıç Tarihi"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <DatePicker
            label="Bitiş Tarihi"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ ml: 'auto' }}
          >
            Yeni İşlem
          </Button>
        </Box>

        {/* İşlemler Tablosu */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Ödeme Yöntemi</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={categoryLabels[transaction.category]}
                        size="small"
                        color={transaction.transactionType === 'INCOME' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={transaction.transactionType === 'INCOME' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        ₺{transaction.amount.toLocaleString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.transactionType === 'INCOME' ? 'Gelir' : 'Gider'}
                        size="small"
                        color={transaction.transactionType === 'INCOME' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.paymentMethod && paymentMethodLabels[transaction.paymentMethod]}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(transaction)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(transaction.id!)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* İşlem Ekleme/Düzenleme Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTransaction ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="İşlem Tarihi"
                  value={new Date(formData.transactionDate)}
                  onChange={(newValue) =>
                    setFormData({ ...formData, transactionDate: newValue?.toISOString() || '' })
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Tutar"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>İşlem Tipi</InputLabel>
                  <Select
                    value={formData.transactionType}
                    onChange={(e) => {
                      const type = e.target.value as 'INCOME' | 'EXPENSE';
                      setFormData({
                        ...formData,
                        transactionType: type,
                        category: transactionCategories[type][0],
                      });
                    }}
                  >
                    <MenuItem value="INCOME">Gelir</MenuItem>
                    <MenuItem value="EXPENSE">Gider</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {transactionCategories[formData.transactionType].map((category) => (
                      <MenuItem key={category} value={category}>
                        {categoryLabels[category]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <TextField
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              
              <FormControl fullWidth>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Notlar"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingTransaction ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default FinancialTransactions; 