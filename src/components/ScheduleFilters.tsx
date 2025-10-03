import React from 'react';
import {
  Paper,
  Box,
  FormControl,
  Typography,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Teacher, Student } from '../services/api';

interface ScheduleFiltersProps {
  teachers: Teacher[];
  students: Student[];
  selectedTeacher: number | null;
  selectedStudent: number | null;
  selectedLessonType: number | null;
  selectedDay: string | null;
  onFilterChange: (filters: {
    teacherId: number | null;
    studentId: number | null;
    lessonType: number | null;
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
        <FormControl sx={{ minWidth: 240 }}>
          <Autocomplete
            options={teachers}
            getOptionLabel={(t) => (t ? `${t.firstName} ${t.lastName}` : '')}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={teachers.find(t => t.id === selectedTeacher) || null}
            onChange={(_, newVal) => handleFilterChange('teacherId', newVal ? newVal.id : null)}
            renderInput={(params) => (
              <TextField {...params} label="Öğretmen" placeholder="İsim yazarak ara" />
            )}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 240 }}>
          <Autocomplete
            options={students}
            getOptionLabel={(s) => (s ? `${s.firstName} ${s.lastName}` : '')}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={students.find(s => s.id === selectedStudent) || null}
            onChange={(_, newVal) => handleFilterChange('studentId', newVal ? newVal.id : null)}
            renderInput={(params) => (
              <TextField {...params} label="Öğrenci" placeholder="İsim yazarak ara" />
            )}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Autocomplete
            options={lessonTypes}
            getOptionLabel={(lt) => (lt ? lt.label : '')}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={lessonTypes.find(lt => lt.id === selectedLessonType) || null}
            onChange={(_, newVal) => handleFilterChange('lessonType', newVal ? newVal.id : null)}
            renderInput={(params) => (
              <TextField {...params} label="Ders Türü" placeholder="Yazarak ara" />
            )}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Autocomplete
            options={weekDays}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(opt, val) => opt.value === val.value}
            value={selectedDay ? weekDays.find(d => d.value === selectedDay) || null : null}
            onChange={(_, newVal) => handleFilterChange('dayOfWeek', newVal ? newVal.value : null)}
            renderInput={(params) => (
              <TextField {...params} label="Gün" placeholder="Yazarak ara" />
            )}
          />
        </FormControl>
      </Box>
    </Paper>
  );
};

export default ScheduleFilters; 