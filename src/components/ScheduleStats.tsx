import React from 'react';
import {
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { LessonSchedule, Teacher, Student } from '../services/api';

interface ScheduleStatsProps {
  schedules: LessonSchedule[];
  teachers: Teacher[];
  students: Student[];
}

const ScheduleStats: React.FC<ScheduleStatsProps> = ({
  schedules,
  teachers,
  students,
}) => {
  const activeSchedules = schedules.filter(schedule => schedule.isActive);
  const totalLessons = activeSchedules.length;
  
  const lessonTypeStats = activeSchedules.reduce((acc, schedule) => {
    acc[schedule.lessonType] = (acc[schedule.lessonType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dayStats = activeSchedules.reduce((acc, schedule) => {
    acc[schedule.dayOfWeek] = (acc[schedule.dayOfWeek] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teacherStats = teachers.map(teacher => ({
    ...teacher,
    lessonCount: activeSchedules.filter(schedule => schedule.teacherId === teacher.id).length,
  }));

  const studentStats = students.map(student => ({
    ...student,
    lessonCount: activeSchedules.filter(schedule => schedule.studentId === student.id).length,
  }));

  const getLessonTypeColor = (lessonType: string) => {
    const colors: { [key: string]: string } = {
      PIANO: '#4CAF50',
      GUITAR: '#2196F3',
      VIOLIN: '#9C27B0',
      DRUMS: '#FF9800',
      VOICE: '#F44336',
      FLUTE: '#00BCD4',
      OTHER: '#607D8B',
    };
    return colors[lessonType] || '#607D8B';
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      MONDAY: '#4CAF50',
      TUESDAY: '#2196F3',
      WEDNESDAY: '#9C27B0',
      THURSDAY: '#FF9800',
      FRIDAY: '#F44336',
      SATURDAY: '#00BCD4',
      SUNDAY: '#607D8B',
    };
    return colors[day] || '#607D8B';
  };

  const getDayLabel = (day: string) => {
    const labels: { [key: string]: string } = {
      MONDAY: 'Pazartesi',
      TUESDAY: 'Salı',
      WEDNESDAY: 'Çarşamba',
      THURSDAY: 'Perşembe',
      FRIDAY: 'Cuma',
      SATURDAY: 'Cumartesi',
      SUNDAY: 'Pazar',
    };
    return labels[day] || day;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        İstatistikler
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Genel İstatistikler */}
        <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h4" color="primary">
            {totalLessons}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam Aktif Ders
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h4" color="primary">
            {teachers.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam Öğretmen
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h4" color="primary">
            {students.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam Öğrenci
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h4" color="primary">
            {Object.keys(lessonTypeStats).length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ders Türü
          </Typography>
        </Box>
      </Box>

      {/* Ders Türü Dağılımı */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Ders Türü Dağılımı
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(lessonTypeStats).map(([type, count]) => (
            <Box
              key={type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: getLessonTypeColor(type),
                color: 'white',
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {type}
              </Typography>
              <Typography variant="body2">
                ({count})
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Günlük Dağılım */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Günlük Dağılım
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(dayStats).map(([day, count]) => (
            <Box
              key={day}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: getDayColor(day),
                color: 'white',
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {getDayLabel(day)}
              </Typography>
              <Typography variant="body2">
                ({count})
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* En Aktif Öğretmenler */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          En Aktif Öğretmenler
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {teacherStats
            .filter(teacher => teacher.lessonCount > 0)
            .sort((a, b) => b.lessonCount - a.lessonCount)
            .slice(0, 5)
            .map(teacher => (
              <Box
                key={teacher.id}
                sx={{
                  p: 1,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {teacher.firstName} {teacher.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {teacher.lessonCount} ders
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ScheduleStats; 