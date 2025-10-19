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
import { studentAPI, teacherAPI, lessonTypeAPI, Student, Teacher, LessonType } from '../services/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [lessonTypesLoading, setLessonTypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [formData, setFormData] = useState<Student>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    instrument: '',
    skillLevel: 'BEGINNER',
    parentName: '',
    parentPhone: '',
    secondParentName: '',
    secondParentPhone: '',
    notes: '',
    teacherId: 0,
    status: 'ACTIVE',
  });

  const [lessonDuration, setLessonDuration] = useState<'FULL' | 'HALF'>('FULL');


  useEffect(() => {
    fetchTeachers();
    fetchLessonTypes();
    if (isEditMode) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setInitialLoading(true);
      const response = await studentAPI.getById(parseInt(id!));
      const data = response.data as Student;
      setFormData({
        ...data,
        email: (data as any).email || '',
        phoneNumber: formatPhone(data.phoneNumber || ''),
        parentPhone: formatPhone(data.parentPhone || ''),
        secondParentPhone: formatPhone(data.secondParentPhone || ''),
      });
    } catch (err) {
      setError('Öğrenci bilgileri yüklenirken bir hata oluştu');
      console.error('Fetch student error:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const response = await teacherAPI.getAll();
      setTeachers(response.data);
    } catch (err) {
      setError('Öğretmenler yüklenirken bir hata oluştu');
      console.error('Fetch teachers error:', err);
    } finally {
      setTeachersLoading(false);
    }
  };

  const fetchLessonTypes = async () => {
    try {
      setLessonTypesLoading(true);
      const response = await lessonTypeAPI.getAll();
      setLessonTypes(response.data);
    } catch (err) {
      setError('Ders türleri yüklenirken bir hata oluştu');
      console.error('Fetch lesson types error:', err);
    } finally {
      setLessonTypesLoading(false);
    }
  };

  // Telefon numarası formatı: 0555-123-1212
  const formatPhone = (value: string): string => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  };

  const unmaskPhone = (value: string): string => (value || '').replace(/\D/g, '');

  const handlePhoneChange = (
    field: 'phoneNumber' | 'parentPhone' | 'secondParentPhone',
    raw: string
  ) => {
    const formatted = formatPhone(raw);
    setFormData(prev => ({ ...prev, [field]: formatted } as Student));
  };

  const handleInputChange = (field: keyof Student, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Öğretmen filtreleme: seçilen enstrümana göre
  const teacherCanTeachInstrument = (teacher: Teacher, instrument: string): boolean => {
    if (!instrument) return true;
    const ltMatch = (teacher.lessonTypes || []).some(lt => lt.name === instrument);
    const instMatch = (teacher.instrument || '').toLowerCase() === instrument.toLowerCase();
    return ltMatch || instMatch;
  };

  const filteredTeachers = (formData.instrument ? teachers.filter(t => teacherCanTeachInstrument(t, formData.instrument)) : teachers);

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
    // Doğum tarihi opsiyonel
    if (!formData.instrument.trim()) {
      setError('Enstrüman alanı zorunludur');
      return false;
    }
    if (!formData.parentName.trim()) {
      setError('Veli adı zorunludur');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      setError('Veli telefonu zorunludur');
      return false;
    }
    if (!formData.teacherId) {
      setError('Öğretmen seçimi zorunludur');
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
      const payload: Student = {
        ...formData,
        email: (formData.email && formData.email.trim()) ? formData.email.trim() : undefined,
        phoneNumber: unmaskPhone(formData.phoneNumber),
        parentPhone: unmaskPhone(formData.parentPhone),
        secondParentPhone: unmaskPhone(formData.secondParentPhone || ''),
        dateOfBirth: (formData.dateOfBirth && String(formData.dateOfBirth).trim()) ? formData.dateOfBirth : undefined,
      } as Student;
      if (isEditMode) {
        await studentAPI.update(parseInt(id!), payload);
      } else {
        await studentAPI.create(payload);
      }
      navigate('/students');
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditMode ? 'Öğrenci güncellenirken bir hata oluştu' : 'Öğrenci eklenirken bir hata oluştu'));
      console.error(isEditMode ? 'Update student error:' : 'Create student error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || teachersLoading || lessonTypesLoading) {
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
          onClick={() => navigate('/students')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
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
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Öğrenci Bilgileri */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Öğrenci Bilgileri
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Ad *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Soyad *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Telefon *"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange('phoneNumber', e.target.value)}
                  required
                  placeholder="0555-123-1212"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Doğum Tarihi"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => {
                      const next: any = { ...prev };
                      if (val) {
                        next.dateOfBirth = val;
                      } else {
                        delete next.dateOfBirth;
                      }
                      return next;
                    });
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  fullWidth
                  label="Enstrüman *"
                  value={formData.instrument}
                  onChange={(e) => {
                    const newInstrument = e.target.value as string;
                    // Enstrüman değişince mevcut öğretmen bu enstrümanı vermiyorsa temizle
                    const currentTeacher = teachers.find(t => t.id === formData.teacherId);
                    const stillValid = currentTeacher ? teacherCanTeachInstrument(currentTeacher, newInstrument) : false;
                    if (!stillValid) {
                      setFormData(prev => ({ ...prev, instrument: newInstrument, teacherId: 0 }));
                    } else {
                      handleInputChange('instrument', newInstrument);
                    }
                  }}
                  required
                >
                  {lessonTypes.map((lessonType) => (
                    <MenuItem key={lessonType.id} value={lessonType.name}>
                      {lessonType.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  select
                  fullWidth
                  label="Ders Süresi *"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value as 'FULL' | 'HALF')}
                  required
                >
                  <MenuItem value="FULL">Tam ders</MenuItem>
                  <MenuItem value="HALF">Yarım ders</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Durum *"
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => handleInputChange('status' as any, e.target.value)}
                  required
                >
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="PASSIVE">Pasif</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Öğretmen *"
                  value={formData.teacherId}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value as string);
                    const selectedTeacher = teachers.find(t => t.id === selectedId);
                    handleInputChange('teacherId', selectedId);
                  }}
                  required
                >
                  {filteredTeachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                      {` - ${(teacher.lessonTypes && teacher.lessonTypes.length > 0)
                        ? teacher.lessonTypes.map(lt => lt.name).join(', ')
                        : (teacher.instrument || '')}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Veli Bilgileri */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Veli Bilgileri
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Veli Adı *"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Veli Telefonu *"
                  value={formData.parentPhone}
                  onChange={(e) => handlePhoneChange('parentPhone', e.target.value)}
                  required
                  placeholder="0555-123-1212"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Box>

              {/* 2. Veli Bilgileri (opsiyonel) */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  İkinci Veli Bilgileri (Opsiyonel)
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="2. Veli Adı"
                  value={formData.secondParentName || ''}
                  onChange={(e) => handleInputChange('secondParentName' as any, e.target.value)}
                />
                <TextField
                  fullWidth
                  label="2. Veli Telefonu"
                  value={formData.secondParentPhone || ''}
                  onChange={(e) => handlePhoneChange('secondParentPhone', e.target.value)}
                  placeholder="0555-123-1212"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Box>

              {/* Notlar */}
              <Box>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Öğrenci hakkında notlar..."
                />
              </Box>

              {/* Butonlar */}
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/students')}
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

export default StudentForm; 