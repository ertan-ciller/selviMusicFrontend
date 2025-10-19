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
  Chip,
  Stack,
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
    color: '#2980B9',
    notes: '',
    lessonTypeIds: [],
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
      setFormData({
        ...response.data,
        lessonTypeIds: response.data.lessonTypes?.map((lt) => lt.id!) || [],
      });
    } catch (err) {
      setError('Öğretmen bilgileri yüklenirken bir hata oluştu');
      console.error('Fetch teacher error:', err);
    } finally {
      setInitialLoading(false);
    }
  };



  const handleInputChange = (field: keyof Teacher, value: string | number | number[]) => {
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
    // E-posta opsiyonel
    if (!formData.phoneNumber.trim()) {
      setError('Telefon alanı zorunludur');
      return false;
    }
    if (formData.experienceYears < 0) {
      setError('Deneyim yılı 0\'dan küçük olamaz');
      return false;
    }
    if (!formData.lessonTypeIds || formData.lessonTypeIds.length === 0) {
      setError('En az bir ders türü seçilmelidir');
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
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Ad *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                autoComplete="given-name"
              />
              <TextField
                fullWidth
                label="Soyad *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                autoComplete="family-name"
              />
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Telefon *"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                placeholder="0555-123-4567"
                autoComplete="tel"
              />
              {/* Enstrüman alanı kaldırıldı */}
              <TextField
                select
                fullWidth
                label="Ders Türleri *"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((id) => {
                        const lt = lessonTypes.find((l) => l.id === id);
                        return <Chip key={id} label={lt?.name || id} size="small" />;
                      })}
                    </Box>
                  ),
                }}
                value={formData.lessonTypeIds || []}
                onChange={(e) => {
                  const value = e.target.value as unknown as number[] | string[];
                  const ids = Array.isArray(value) ? value.map((v) => Number(v)) : [];
                  handleInputChange('lessonTypeIds', ids);
                }}
                required
              >
                {lessonTypes.map((lessonType) => (
                  <MenuItem key={lessonType.id} value={lessonType.id}>
                    {lessonType.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Renk Kodu"
                value={formData.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#2980B9"
                helperText="HEX renk (ör. #FF5733). Sol taraftan da seçebilirsiniz."
                InputProps={{
                  startAdornment: (
                    <input
                      type="color"
                      value={formData.color || '#2980B9'}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      style={{
                        width: 28,
                        height: 28,
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        marginRight: 8,
                        cursor: 'pointer',
                      }}
                    />
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Deneyim Yılı *"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Biyografi"
                multiline
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Öğretmen hakkında kısa bilgi..."
              />
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes' as keyof Teacher, e.target.value)}
                placeholder="Bu öğretmene özel notlar..."
              />
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 1 }}>
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
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherForm; 