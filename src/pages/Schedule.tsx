import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonOff as PersonOffIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, startOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { lessonScheduleAPI, teacherAPI, studentAPI, lessonAttendanceAPI, LessonSchedule, Teacher, Student, LessonAttendance, CreateLessonAttendanceRequest } from '../services/api';
import LessonForm from '../components/LessonForm';
import ScheduleFilters from '../components/ScheduleFilters';
import ScheduleStats from '../components/ScheduleStats';

const Schedule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedules, setSchedules] = useState<LessonSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<LessonSchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<LessonAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LessonSchedule | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter states
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedLessonType, setSelectedLessonType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const dayKeys = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schedules, selectedTeacher, selectedStudent, selectedLessonType, selectedDay]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, teachersRes, studentsRes, attendancesRes] = await Promise.all([
        lessonScheduleAPI.getAll(),
        teacherAPI.getAll(),
        studentAPI.getAll(),
        lessonAttendanceAPI.getAll(),
      ]);
      setSchedules(schedulesRes.data);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
      setAttendances(attendancesRes.data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schedules];

    if (selectedTeacher) {
      filtered = filtered.filter(schedule => schedule.teacherId === selectedTeacher);
    }

    if (selectedStudent) {
      filtered = filtered.filter(schedule => schedule.studentId === selectedStudent);
    }

    if (selectedLessonType) {
      filtered = filtered.filter(schedule => schedule.lessonType === selectedLessonType);
    }

    if (selectedDay) {
      filtered = filtered.filter(schedule => schedule.dayOfWeek === selectedDay);
    }

    setFilteredSchedules(filtered);
  };

  const handleFilterChange = (filters: {
    teacherId: number | null;
    studentId: number | null;
    lessonType: string | null;
    dayOfWeek: string | null;
  }) => {
    setSelectedTeacher(filters.teacherId);
    setSelectedStudent(filters.studentId);
    setSelectedLessonType(filters.lessonType);
    setSelectedDay(filters.dayOfWeek);
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const getSchedulesForDay = (dayKey: string) => {
    return filteredSchedules.filter(schedule => schedule.dayOfWeek === dayKey && schedule.isActive);
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Bilinmeyen Öğretmen';
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Bilinmeyen Öğrenci';
  };

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

  const handleAddLesson = () => {
    setEditingSchedule(null);
    setOpenForm(true);
  };

  const handleEditLesson = (schedule: LessonSchedule) => {
    setEditingSchedule(schedule);
    setOpenForm(true);
  };

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      try {
        await lessonScheduleAPI.delete(id);
        setSnackbar({ open: true, message: 'Ders başarıyla silindi', severity: 'success' });
        loadData();
      } catch (err) {
        setSnackbar({ open: true, message: 'Ders silinirken hata oluştu', severity: 'error' });
      }
    }
  };

  const handleFormSubmit = async (schedule: LessonSchedule) => {
    try {
      if (editingSchedule) {
        await lessonScheduleAPI.update(editingSchedule.id!, schedule);
        setSnackbar({ open: true, message: 'Ders başarıyla güncellendi', severity: 'success' });
      } else {
        await lessonScheduleAPI.create(schedule);
        setSnackbar({ open: true, message: 'Ders başarıyla eklendi', severity: 'success' });
      }
      setOpenForm(false);
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'İşlem sırasında hata oluştu', severity: 'error' });
    }
  };

  // Ders tamamlama fonksiyonları
  const handleMarkAttendance = async (schedule: LessonSchedule, status: 'COMPLETED' | 'CANCELLED' | 'ABSENT', lessonDate: Date) => {
    try {
      const formattedDate = format(lessonDate, 'yyyy-MM-dd');
      
      // Önce bu ders için attendance kaydı var mı kontrol et
      const existingAttendance = attendances.find(
        att => att.lessonScheduleId === schedule.id && att.lessonDate === formattedDate
      );

      const request: CreateLessonAttendanceRequest = {
        lessonScheduleId: schedule.id!,
        lessonDate: formattedDate,
        status,
        notes: status === 'COMPLETED' ? 'Ders başarıyla tamamlandı' : 
               status === 'CANCELLED' ? 'Ders iptal edildi' : 'Öğrenci devamsızlık yaptı'
      };

      if (existingAttendance) {
        await lessonAttendanceAPI.update(existingAttendance.id!, request);
        setSnackbar({ open: true, message: 'Ders durumu güncellendi', severity: 'success' });
      } else {
        await lessonAttendanceAPI.create(request);
        setSnackbar({ open: true, message: 'Ders durumu kaydedildi', severity: 'success' });
      }
      
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Ders durumu kaydedilirken hata oluştu', severity: 'error' });
    }
  };

  const getAttendanceStatus = (scheduleId: number, lessonDate: Date): LessonAttendance['status'] | null => {
    const formattedDate = format(lessonDate, 'yyyy-MM-dd');
    const attendance = attendances.find(
      att => att.lessonScheduleId === scheduleId && att.lessonDate === formattedDate
    );
    return attendance ? attendance.status : null;
  };

  const getAttendanceStatusColor = (status: LessonAttendance['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#F44336';
      case 'ABSENT':
        return '#FF9800';
      case 'RESCHEDULED':
        return '#2196F3';
      default:
        return '#607D8B';
    }
  };

  const getAttendanceStatusText = (status: LessonAttendance['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal';
      case 'ABSENT':
        return 'Devamsızlık';
      case 'RESCHEDULED':
        return 'Ertelendi';
      default:
        return 'Planlandı';
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, 1),
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Haftalık Ders Programı
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLesson}
          sx={{ borderRadius: 2 }}
        >
          Yeni Ders Ekle
        </Button>
      </Box>

      {/* Statistics */}
      <ScheduleStats
        schedules={schedules}
        teachers={teachers}
        students={students}
      />

      {/* Filters */}
      <ScheduleFilters
        teachers={teachers}
        students={students}
        selectedTeacher={selectedTeacher}
        selectedStudent={selectedStudent}
        selectedLessonType={selectedLessonType}
        selectedDay={selectedDay}
        onFilterChange={handleFilterChange}
      />

      {/* Week Navigation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              {format(weekStart, 'dd MMMM yyyy', { locale: tr })} - {format(addWeeks(weekStart, 1), 'dd MMMM yyyy', { locale: tr })}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={handleToday}
              size="small"
            >
              Bugün
            </Button>
          </Box>
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Time slots column */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: 90, flexShrink: 0 }}>
          <Box sx={{ height: 112 }} /> {/* Header spacer */}
          {Array.from({ length: 12 }, (_, i) => (
            <Box
              key={i}
              sx={{
                height: 113,
                borderTop: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: '#666',
              }}
            >
              {`${i + 8}:00`}
            </Box>
          ))}
        </Box>

        {/* Days columns */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
          {dayKeys.map((dayKey, dayIndex) => (
            <Box key={dayKey} sx={{ flex: 1, minWidth: { xs: '100%', sm: 200, md: 150 } }}>
              <Paper
                sx={{
                  p: 1,
                  height: '100%',
                  backgroundColor: dayIndex >= 5 ? '#fafafa' : 'white',
                  minHeight: { xs: 400, md: 'auto' },
                }}
              >
                {/* Day header */}
                <Box
                  sx={{
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #e0e0e0',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {weekDays[dayIndex]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(weekDates[dayIndex], 'dd MMM', { locale: tr })}
                  </Typography>
                </Box>

                {/* Time slots */}
                <Box sx={{ position: 'relative' }}>
                  {Array.from({ length: 12 }, (_, timeSlot) => {
                    const hour = timeSlot + 8;
                    
                    const timeString = `${hour.toString().padStart(2, '0')}:00`;
                    const daySchedules = getSchedulesForDay(dayKey);
                    const scheduleForThisTime = daySchedules.find(
                      schedule => schedule.startTime.slice(0, 5) === timeString
                    );
                    

                    return (
                      <Box
                        key={timeSlot}
                        sx={{
                          height: { xs: 120 , md: 110 },
                          borderBottom: '1px solid #e0e0e0',
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        {/* Time label for mobile */}
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            top: 2,
                            left: 2,
                            color: '#666',
                            display: { xs: 'block', md: 'none' },
                            fontSize: '0.7rem',
                          }}
                        >
                          {timeString}
                        </Typography>
                        
                        {scheduleForThisTime && (
                          <Card
                            sx={{
                              position: 'absolute',
                              top: { xs: 20, md: 4 },
                              left: { xs: 2, md: 4 },
                              right: { xs: 2, md: 4 },
                              bottom: { xs: 2, md: 4 },
                              backgroundColor: getLessonTypeColor(scheduleForThisTime.lessonType),
                              color: 'white',
                              zIndex: 1,
                            }}
                          >
                            <CardContent sx={{ p: { xs: 0.5, md: 1 }, '&:last-child': { pb: { xs: 0.5, md: 1 } } }}>
                              <Typography 
                                variant="caption" 
                                display="block" 
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                              >
                                {getStudentName(scheduleForThisTime.studentId)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                              >
                                {getTeacherName(scheduleForThisTime.teacherId)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                              >
                                {scheduleForThisTime.lessonType}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                              >
                                {scheduleForThisTime.startTime.slice(0, 5)} - {scheduleForThisTime.endTime.slice(0, 5)}
                              </Typography>
                              
                              {/* Attendance Status */}
                              {(() => {
                                const attendanceStatus = getAttendanceStatus(scheduleForThisTime.id!, weekDates[dayIndex]);
                                return attendanceStatus ? (
                                  <Chip
                                    label={getAttendanceStatusText(attendanceStatus)}
                                    size="small"
                                    sx={{
                                      backgroundColor: getAttendanceStatusColor(attendanceStatus),
                                      color: 'white',
                                      fontSize: { xs: '0.6rem', md: '0.7rem' },
                                      height: { xs: 16, md: 20 },
                                      mt: 0.5,
                                    }}
                                  />
                                ) : null;
                              })()}
                              
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                {/* Attendance Buttons */}
                                <Tooltip title="Dersi Tamamla">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAttendance(scheduleForThisTime, 'COMPLETED', weekDates[dayIndex])}
                                    sx={{ 
                                      color: 'white', 
                                      p: { xs: 0.25, md: 0.5 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Dersi İptal Et">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAttendance(scheduleForThisTime, 'CANCELLED', weekDates[dayIndex])}
                                    sx={{ 
                                      color: 'white', 
                                      p: { xs: 0.25, md: 0.5 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                      }
                                    }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Devamsızlık">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAttendance(scheduleForThisTime, 'ABSENT', weekDates[dayIndex])}
                                    sx={{ 
                                      color: 'white', 
                                      p: { xs: 0.25, md: 0.5 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                      }
                                    }}
                                  >
                                    <PersonOffIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                {/* Edit and Delete Buttons */}
                                <Tooltip title="Düzenle">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditLesson(scheduleForThisTime)}
                                    sx={{ 
                                      color: 'white', 
                                      p: { xs: 0.25, md: 0.5 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                      }
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Sil">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteLesson(scheduleForThisTime.id!)}
                                    sx={{ 
                                      color: 'white', 
                                      p: { xs: 0.25, md: 0.5 },
                                      '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1rem', md: '1.25rem' }
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Lesson Form Dialog */}
      <LessonForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        schedule={editingSchedule}
        teachers={teachers}
        students={students}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add lesson"
        onClick={handleAddLesson}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Schedule; 