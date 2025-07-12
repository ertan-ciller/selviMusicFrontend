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
  MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, Teacher } from '../services/api';

const TeacherForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Teacher>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    instrument: '',
    experienceYears: 0,
    bio: '',
  });

  const instruments = [
    'Gitar',
    'Piyano',
    'Keman',
    'Davul',
    'Flüt',
    'Saksafon',
    'Viyola',
    'Çello',
    'Kontrbas',
    'Arp',
    'Org',
    'Akordeon',
    'Klarnet',
    'Trompet',
    'Trombon',
    'Vokal',
  ];

  const handleInputChange = (field: keyof Teacher, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('Ad alanı zorunludur');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Soyad alanı zorunludur');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-posta alanı zorunludur');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Telefon alanı zorunludur');
      return false;
    }
    if (!formData.instrument.trim()) {
      setError('Enstrüman alanı zorunludur');
      return false;
    }
    if (formData.experienceYears < 0) {
      setError('Deneyim yılı 0\'dan küçük olamaz');
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
      await teacherAPI.create(formData);
      navigate('/teachers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Öğretmen eklenirken bir hata oluştu');
      console.error('Create teacher error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teachers')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h4">
          Yeni Öğretmen Ekle
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
                  label="Ad *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Soyad *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="E-posta *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Telefon *"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                  placeholder="0555-123-4567"
                />
              </Box>
              <Box flex={1}>
                <TextField
                  select
                  fullWidth
                  label="Enstrüman *"
                  value={formData.instrument}
                  onChange={(e) => handleInputChange('instrument', e.target.value)}
                  required
                >
                  {instruments.map((instrument) => (
                    <MenuItem key={instrument} value={instrument}>
                      {instrument}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Deneyim Yılı *"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                  required
                  inputProps={{ min: 0 }}
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Biyografi"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Öğretmen hakkında kısa bilgi..."
                />
              </Box>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/teachers')}
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

export default TeacherForm; 