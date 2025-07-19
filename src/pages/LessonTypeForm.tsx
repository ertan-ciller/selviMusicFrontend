import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lessonTypeAPI, LessonType } from '../services/api';

const LessonTypeForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LessonType>({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    isActive: true,
  });

  const handleInputChange = (field: keyof LessonType, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Ders türü adı zorunludur');
      return false;
    }
    if (formData.durationMinutes < 15) {
      setError('Ders süresi en az 15 dakika olmalıdır');
      return false;
    }
    if (formData.price < 0) {
      setError('Fiyat 0\'dan küçük olamaz');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await lessonTypeAPI.create(formData);
      navigate('/lesson-types');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ders türü eklenirken bir hata oluştu');
      console.error('Create lesson type error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/lesson-types')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h4">
          Yeni Ders Türü Ekle
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Ders Türü Adı *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Örn: Piyano Dersi"
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Süre (Dakika) *"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 0)}
                  required
                  inputProps={{ min: 15, step: 15 }}
                  placeholder="30"
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Fiyat (TL) *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="150.00"
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ders türü hakkında açıklama..."
                />
              </Box>
              <Box flex={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Aktif"
                />
              </Box>
              <Box display="flex" gap={2} justifyContent="flex-end" width="100%">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/lesson-types')}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LessonTypeForm; 