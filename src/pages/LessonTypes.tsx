import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lessonTypeAPI, LessonType } from '../services/api';

const LessonTypes = () => {
  const navigate = useNavigate();
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<LessonType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchLessonTypes();
  }, []);

  const fetchLessonTypes = async () => {
    try {
      setLoading(true);
      const response = await lessonTypeAPI.getAll();
      setLessonTypes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ders türleri yüklenirken bir hata oluştu');
      console.error('Fetch lesson types error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lessonType: LessonType) => {
    setEditingId(lessonType.id!);
    setEditData({ ...lessonType });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      const response = await lessonTypeAPI.update(editData.id!, editData);
      setLessonTypes(prev => 
        prev.map(lt => lt.id === editData.id ? response.data : lt)
      );
      setEditingId(null);
      setEditData(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ders türü güncellenirken bir hata oluştu');
      console.error('Update lesson type error:', err);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await lessonTypeAPI.delete(deleteId);
      setLessonTypes(prev => prev.filter(lt => lt.id !== deleteId));
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ders türü silinirken bir hata oluştu');
      console.error('Delete lesson type error:', err);
    }
  };

  const handleInputChange = (field: keyof LessonType, value: string | number | boolean) => {
    if (!editData) return;
    setEditData(prev => ({
      ...prev!,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Ders Türleri
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/lesson-types/new')}
        >
          Yeni Ders Türü
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ders Türü</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Süre (Dakika)</TableCell>
                  <TableCell>Fiyat (TL)</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessonTypes.map((lessonType) => (
                  <TableRow key={lessonType.id}>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <TextField
                          value={editData?.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          size="small"
                        />
                      ) : (
                        lessonType.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <TextField
                          value={editData?.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          size="small"
                          multiline
                          rows={2}
                        />
                      ) : (
                        lessonType.description || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <TextField
                          type="number"
                          value={editData?.durationMinutes || 0}
                          onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 15, step: 15 }}
                        />
                      ) : (
                        lessonType.durationMinutes
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <TextField
                          type="number"
                          value={editData?.price || 0}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                                             ) : (
                         `${(lessonType.price || 0).toFixed(2)} TL`
                       )}
                    </TableCell>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editData?.isActive || false}
                              onChange={(e) => handleInputChange('isActive', e.target.checked)}
                              size="small"
                            />
                          }
                          label=""
                        />
                      ) : (
                        <Chip
                          label={lessonType.isActive ? 'Aktif' : 'Pasif'}
                          color={lessonType.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === lessonType.id ? (
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSaveEdit}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={handleCancelEdit}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(lessonType)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(lessonType.id!)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Ders Türünü Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu ders türünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonTypes; 