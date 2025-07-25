import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { teacherAPI, Teacher, lessonTypeAPI, LessonType } from '../services/api';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [formData, setFormData] = useState<Teacher>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    instrument: '',
    experienceYears: 0,
    bio: '',
  });

  const isEditMode = !!id;

  useEffect(() => {
    fetchLessonTypes();
    if (isEditMode && id) {
      fetchTeacher(parseInt(id));
    }
  }, [isEditMode, id]);

  const fetchLessonTypes = async () => {
    try {
      const response = await lessonTypeAPI.getActive();
      setLessonTypes(response.data);
    } catch (err) {
      console.error('Fetch lesson types error:', err);
      setError('Ders türleri yüklenirken bir hata oluştu');
    }
  };

  const fetchTeacher = async (teacherId: number) => {
    try {
      setInitialLoading(true);
      const response = await teacherAPI.getById(teacherId);
      setFormData(response.data);
    } catch (err) {
      setError('Öğretmen bilgileri yüklenirken bir hata oluştu');
      console.error('Fetch teacher error:', err);
    } finally {
      setInitialLoading(false);
    }
  };



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
      if (isEditMode && id) {
        await teacherAPI.update(parseInt(id), formData);
      } else {
        await teacherAPI.create(formData);
      }
      navigate('/teachers');
    } catch (err: any) {
      setError(err.response?.data?.message || `Öğretmen ${isEditMode ? 'güncellenirken' : 'eklenirken'} bir hata oluştu`);
      console.error(`${isEditMode ? 'Update' : 'Create'} teacher error:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
          {isEditMode ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}
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
                  {lessonTypes.map((lessonType) => (
                    <MenuItem key={lessonType.id} value={lessonType.name}>
                      {lessonType.name}
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
                  {loading ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...') : (isEditMode ? 'Güncelle' : 'Kaydet')}
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