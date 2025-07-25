import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { LessonSchedule, Teacher, Student, Classroom } from '../services/api';

interface LessonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (schedule: LessonSchedule) => void;
  schedule?: LessonSchedule | null;
  teachers: Teacher[];
  students: Student[];
  lessonTypes: { id: number; value: string; label: string }[];
  classrooms: Classroom[];
}

const LessonForm: React.FC<LessonFormProps> = ({
  open,
  onClose,
  onSubmit,
  schedule,
  teachers,
  students,
  lessonTypes,
  classrooms,
}) => {
  const [formData, setFormData] = useState<Partial<LessonSchedule>>({
    studentId: 0,
    teacherId: 0,
    lessonType: 'PIANO',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '09:45',
    isActive: true,
    notes: '',
    classroomId: 0,
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        studentId: schedule.studentId,
        teacherId: schedule.teacherId,
        lessonType: schedule.lessonType,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
        notes: schedule.notes || '',
        classroomId: schedule.classroomId,
      });
    } else {
      setFormData({
        studentId: 0,
        teacherId: 0,
        lessonType: 'PIANO',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '09:45',
        isActive: true,
        notes: '',
        classroomId: 0,
      });
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentId && formData.teacherId) {
      onSubmit(formData as LessonSchedule);
    }
  };

  const handleChange = (field: keyof LessonSchedule, value: any) => {
    if (field === 'lessonType') {
      const selected = lessonTypes.find(t => t.value === value);
      setFormData(prev => ({
        ...prev,
        lessonType: value,
        lessonTypeId: selected ? selected.id : undefined,
      }));
    } else if (field === 'classroomId') {
      setFormData(prev => ({ ...prev, classroomId: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const weekDays = [
    { value: 'MONDAY', label: 'Pazartesi' },
    { value: 'TUESDAY', label: 'Salı' },
    { value: 'WEDNESDAY', label: 'Çarşamba' },
    { value: 'THURSDAY', label: 'Perşembe' },
    { value: 'FRIDAY', label: 'Cuma' },
    { value: 'SATURDAY', label: 'Cumartesi' },
    { value: 'SUNDAY', label: 'Pazar' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {schedule ? 'Ders Düzenle' : 'Yeni Ders Ekle'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth required>
                  <InputLabel>Öğrenci</InputLabel>
                  <Select
                    value={formData.studentId || ''}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    label="Öğrenci"
                  >
                    {students && students.length > 0 ? (
                      students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Öğrenci bulunamadı</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth required>
                  <InputLabel>Öğretmen</InputLabel>
                  <Select
                    value={formData.teacherId || ''}
                    onChange={(e) => handleChange('teacherId', e.target.value)}
                    label="Öğretmen"
                  >
                    {teachers && teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <MenuItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Öğretmen bulunamadı</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth required>
                  <InputLabel>Ders Türü</InputLabel>
                  <Select
                    value={formData.lessonType || ''}
                    onChange={(e) => handleChange('lessonType', e.target.value)}
                    label="Ders Türü"
                  >
                    {lessonTypes && lessonTypes.length > 0 ? (
                      lessonTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Ders türü bulunamadı</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth required>
                  <InputLabel>Gün</InputLabel>
                  <Select
                    value={formData.dayOfWeek || ''}
                    onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                    label="Gün"
                  >
                    {weekDays.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth required>
                  <InputLabel>Derslik</InputLabel>
                  <Select
                    value={formData.classroomId || ''}
                    onChange={(e) => handleChange('classroomId', e.target.value)}
                    label="Derslik"
                  >
                    {classrooms && classrooms.length > 0 ? (
                      classrooms.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Derslik bulunamadı</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Başlangıç Saati"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Bitiş Saati"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained">
            {schedule ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LessonForm; 