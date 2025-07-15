import React from 'react';
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { Teacher, Student } from '../services/api';

interface ScheduleFiltersProps {
  teachers: Teacher[];
  students: Student[];
  selectedTeacher: number | null;
  selectedStudent: number | null;
  selectedLessonType: string | null;
  selectedDay: string | null;
  onFilterChange: (filters: {
    teacherId: number | null;
    studentId: number | null;
    lessonType: string | null;
    dayOfWeek: string | null;
  }) => void;
  lessonTypes: { id: number; value: string; label: string }[];
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  teachers,
  students,
  selectedTeacher,
  selectedStudent,
  selectedLessonType,
  selectedDay,
  onFilterChange,
  lessonTypes,
}) => {
  const weekDays = [
    { value: 'MONDAY', label: 'Pazartesi' },
    { value: 'TUESDAY', label: 'Salı' },
    { value: 'WEDNESDAY', label: 'Çarşamba' },
    { value: 'THURSDAY', label: 'Perşembe' },
    { value: 'FRIDAY', label: 'Cuma' },
    { value: 'SATURDAY', label: 'Cumartesi' },
    { value: 'SUNDAY', label: 'Pazar' },
  ];

  const handleFilterChange = (field: string, value: any) => {
    onFilterChange({
      teacherId: field === 'teacherId' ? value : selectedTeacher,
      studentId: field === 'studentId' ? value : selectedStudent,
      lessonType: field === 'lessonType' ? value : selectedLessonType,
      dayOfWeek: field === 'dayOfWeek' ? value : selectedDay,
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filtreler
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Öğretmen</InputLabel>
          <Select
            value={selectedTeacher || ''}
            onChange={(e) => handleFilterChange('teacherId', e.target.value || null)}
            label="Öğretmen"
          >
            <MenuItem value="">Tümü</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Öğrenci</InputLabel>
          <Select
            value={selectedStudent || ''}
            onChange={(e) => handleFilterChange('studentId', e.target.value || null)}
            label="Öğrenci"
          >
            <MenuItem value="">Tümü</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Ders Türü</InputLabel>
          <Select
            value={selectedLessonType || ''}
            onChange={(e) => handleFilterChange('lessonType', e.target.value || null)}
            label="Ders Türü"
          >
            <MenuItem value="">Tümü</MenuItem>
            {lessonTypes.map((type) => (
              <MenuItem key={type.id} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Gün</InputLabel>
          <Select
            value={selectedDay || ''}
            onChange={(e) => handleFilterChange('dayOfWeek', e.target.value || null)}
            label="Gün"
          >
            <MenuItem value="">Tümü</MenuItem>
            {weekDays.map((day) => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default ScheduleFilters; 