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
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  useMediaQuery,
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
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { format, startOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { lessonScheduleAPI, teacherAPI, studentAPI, lessonAttendanceAPI, LessonSchedule, Teacher, Student, LessonAttendance, CreateLessonAttendanceRequest, lessonTypeAPI, classroomAPI, Classroom } from '../services/api';
import LessonForm from '../components/LessonForm';
import ScheduleFilters from '../components/ScheduleFilters';
import ScheduleStats from '../components/ScheduleStats';
import { useTheme } from '@mui/material/styles';

type ChangeableStatus = 'COMPLETED' | 'CANCELLED' | 'ABSENT' | 'RESCHEDULED';

const Schedule: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmOnly = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

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

  // Status change dialog state
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    schedule: LessonSchedule | null;
    date: Date | null;
    current: LessonAttendance['status'] | null;
    selected: ChangeableStatus | null;
  }>({ open: false, schedule: null, date: null, current: null, selected: null });

  // Filter states (selection)
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedLessonType, setSelectedLessonType] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const dayKeys = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

  const [lessonTypes, setLessonTypes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadLessonTypes();
    loadClassrooms();
  }, []);

  const loadLessonTypes = async () => {
    try {
      const res = await lessonTypeAPI.getAll();
      setLessonTypes(res.data.map((lt: any) => ({
        id: lt.id,
        value: lt.name,
        label: lt.name
      })));
    } catch (err) {
      console.error('Error loading lesson types:', err);
      setLessonTypes([]);
    }
  };

  const loadClassrooms = async () => {
    try {
      const res = await classroomAPI.getAll();
      setClassrooms(res.data);
    } catch (err) {
      console.error('Error loading classrooms:', err);
      setClassrooms([]);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [schedules, selectedTeacher, selectedStudent, selectedLessonType, selectedDay, students]);

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
    // Yalnızca aktif öğrencilerin dersleri
    const activeStudentIds = new Set(
      students
        .filter(s => (s.status || 'ACTIVE') === 'ACTIVE' && s.id != null)
        .map(s => s.id!)
    );
    let filtered = schedules.filter(schedule => activeStudentIds.has(schedule.studentId));

    if (selectedTeacher) {
      filtered = filtered.filter(schedule => schedule.teacherId === selectedTeacher);
    }

    if (selectedStudent) {
      filtered = filtered.filter(schedule => schedule.studentId === selectedStudent);
    }

    if (selectedLessonType) {
      filtered = filtered.filter(schedule => schedule.lessonTypeId === selectedLessonType);
    }

    if (selectedDay) {
      filtered = filtered.filter(schedule => schedule.dayOfWeek === selectedDay);
    }

    setFilteredSchedules(filtered);
  };

  const handleFilterChange = (filters: {
    teacherId: number | null;
    studentId: number | null;
    lessonType: number | null;
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

  // getSchedulesForDay fonksiyonunu güncelle
  const getSchedulesForDay = (dayKey: string, classroomId: number) => {
    return filteredSchedules.filter(
      schedule => schedule.dayOfWeek === dayKey && schedule.isActive && schedule.classroomId === classroomId
    );
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Bilinmeyen Öğretmen';
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Bilinmeyen Öğrenci';
  };

  // Cihaz boyutuna göre öğrenci adını kısaltarak göster
  const getResponsiveStudentLabel = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 'Bilinmeyen';
    const first = (student.firstName || '').trim();
    const last = (student.lastName || '').trim();

    if (isXs) {
      const fi = first ? first.charAt(0) : '';
      const li = last ? last.charAt(0) : '';
      return `${fi}${li}`.toUpperCase(); // Örn: AB
    }
    if (isSmOnly) {
      return `${first} ${last ? last.charAt(0) + '.' : ''}`; // Örn: Ali Y.
    }
    return `${first} ${last}`;
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

  const getClassroomName = (classroomId: number) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? classroom.name : '';
  };

  const getTeacherColor = (teacherId: number | undefined) => {
    const palette = [
      '#8E44AD', '#2980B9', '#27AE60', '#D35400', '#C0392B', '#16A085',
      '#2C3E50', '#7F8C8D', '#9B59B6', '#1ABC9C', '#F39C12', '#E74C3C',
    ];
    if (!teacherId) return palette[0];
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher && teacher.color && /^#([0-9a-fA-F]{3}){1,2}$/.test(teacher.color)) {
      return teacher.color;
    }
    const index = Math.abs(teacherId) % palette.length;
    return palette[index];
  };

  const getScheduleForSlot = (dayKey: string, classroomId: number, timeString: string) => {
    return filteredSchedules.find(
      s => s.dayOfWeek === dayKey && s.isActive && s.classroomId === classroomId && s.startTime.slice(0, 5) === timeString
    ) || null;
  };

  const renderTeacherLegend = () => (
    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {teachers.map(t => (
        <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
          <Box sx={{ width: 16, height: 10, borderRadius: 0.5, backgroundColor: getTeacherColor(t.id) }} />
          <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
            {`${t.firstName} ${t.lastName}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );

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
        const message = (err as any)?.message || 'Ders silinirken hata oluştu';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    }
  };

  const handleFormSubmit = async (schedule: LessonSchedule) => {
    try {
      let lessonTypeId = schedule.lessonTypeId;
      if (!lessonTypeId && schedule.lessonType) {
        const found = lessonTypes.find(t => t.value === schedule.lessonType);
        lessonTypeId = found ? found.id : 0;
      }
      const scheduleWithTypeId = { ...schedule, lessonTypeId };
      if (editingSchedule) {
        await lessonScheduleAPI.update(editingSchedule.id!, scheduleWithTypeId);
        setSnackbar({ open: true, message: 'Ders başarıyla güncellendi', severity: 'success' });
      } else {
        await lessonScheduleAPI.create(scheduleWithTypeId);
        setSnackbar({ open: true, message: 'Ders başarıyla eklendi', severity: 'success' });
      }
      setOpenForm(false);
      loadData();
    } catch (err) {
      const message = (err as any)?.message || 'İşlem sırasında hata oluştu';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Ders durumunu kaydetme
  const handleMarkAttendance = async (schedule: LessonSchedule, status: 'COMPLETED' | 'CANCELLED' | 'ABSENT' | 'RESCHEDULED', lessonDate: Date) => {
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
               status === 'CANCELLED' ? 'Ders iptal edildi' :
               status === 'ABSENT' ? 'Öğrenci devamsızlık yaptı' : 'İnsiyatif'
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
      const message = (err as any)?.message || 'Ders durumu kaydedilirken hata oluştu';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const openStatusChangeDialog = (schedule: LessonSchedule, lessonDate: Date, current: LessonAttendance['status'] | null) => {
    const selectable: ChangeableStatus | null =
      current === 'COMPLETED' || current === 'CANCELLED' || current === 'ABSENT' || current === 'RESCHEDULED'
        ? current
        : null;
    setStatusDialog({ open: true, schedule, date: lessonDate, current, selected: selectable });
  };

  const confirmStatusChange = async () => {
    if (!statusDialog.open || !statusDialog.schedule || !statusDialog.date || !statusDialog.selected) {
      setStatusDialog({ open: false, schedule: null, date: null, current: null, selected: null });
      return;
    }
    await handleMarkAttendance(statusDialog.schedule, statusDialog.selected as ChangeableStatus, statusDialog.date);
    setStatusDialog({ open: false, schedule: null, date: null, current: null, selected: null });
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

  // Diyalogda aksiyon isimleri için (chip aksiyon etiketleriyle aynı)
  const getAttendanceActionLabel = (status: ChangeableStatus) => {
    switch (status) {
      case 'RESCHEDULED':
        return 'İnsiyatif';
      case 'ABSENT':
        return 'Dersi Yak';
      case 'COMPLETED':
        return 'Tamamla';
      case 'CANCELLED':
        return 'İptal';
    }
  };

  const renderStatusBadge = (status: ChangeableStatus) => {
    const bg = getAttendanceStatusColor(status);
    const IconComp =
      status === 'COMPLETED' ? CheckCircleIcon :
      status === 'CANCELLED' ? CancelIcon :
      status === 'RESCHEDULED' ? GavelIcon : PersonOffIcon;
    return (
      <Box sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
        flex: '0 0 auto',
      }}>
        <IconComp sx={{ fontSize: '0.9rem', color: '#ffffff' }} />
      </Box>
    );
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, 1),
  });

  // Tüm derslikleri tek tabloda (her saat 8'e bölünmüş) gösteren grid
  const renderUnifiedWeeklyGrid = () => (
    <Box sx={{ mb: 6 }}>
      <Paper sx={{ p: 1 }}>
        {/* Üst başlık: Gün & Derslik sabit sütunları + saatler */}
        {(() => {
          const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
          // Responsive grid column definitions to avoid horizontal scroll
          const leftColXs = 'minmax(72px, 92px)';
          const leftColMd = '70px';
          const classroomColXs = 'minmax(56px, 76px)';
          const classroomColMd = '75px';
          const hourCols = `repeat(${hours.length}, minmax(0, 1fr))`;
          return (
            <>
              <Box sx={{ mb: 1, display: 'grid', gridTemplateColumns: { xs: `${leftColXs} ${classroomColXs} ${hourCols}`, md: `${leftColMd} ${classroomColMd} ${hourCols}` }, gap: 0.5 }}>
                <Box />
                <Box />
                {hours.map(h => (
                  <Box key={h} sx={{ textAlign: 'center', border: '1px solid #eee', borderRadius: 1, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}>{h}</Typography>
                  </Box>
                ))}
              </Box>
              {/* Gövde: Gün başlığı tek, tüm derslikleri kapsayacak şekilde sol sütunda; sağda derslik satırları */}
              {dayKeys.map((dayKey, dayIndex) => (
                <Box key={dayKey} sx={{ display: 'grid', gridTemplateColumns: { xs: `${leftColXs} ${classroomColXs} ${hourCols}`, md: `${leftColMd} ${classroomColMd} ${hourCols}` }, gap: 0.5, mb: 0.5, gridAutoRows: { xs: '26px', md: '23px' }, borderBottom: (theme) => dayIndex < dayKeys.length - 1 ? `1px solid ${theme.palette.divider}` : 'none', pb: 0.5 }}>
                  {/* Sol: Gün etiketi tüm derslik satırlarını kapsar */}
                  <Box sx={{ gridRow: `1 / span ${classrooms.length}`, border: '1px solid #ddd', borderRadius: 1, px: 1, py: 0.5, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' }, fontWeight: 700 }}>{weekDays[dayIndex]}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.62rem', md: '0.68rem' } }}>{format(weekDates[dayIndex], 'dd MMM', { locale: tr })}</Typography>
                    </Box>
                  </Box>
                  {/* Sağ: her derslik için bir satır */}
                  {classrooms.map(c => (
                    <React.Fragment key={`${dayKey}-${c.id}`}>
                      <Box sx={{ textAlign: 'left', border: '1px solid #eee', borderRadius: 1, px: 0.4, py: 0.1 }}>
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.58rem', md: '0.65rem' } }}>{c.name}</Typography>
                      </Box>
                      {hours.map(h => {
                        const scheduleForThisTime = getScheduleForSlot(dayKey, c.id, h);
                        const currentStatus = scheduleForThisTime ? getAttendanceStatus(scheduleForThisTime.id!, weekDates[dayIndex]) : null;
                        const statusColor = currentStatus ? getAttendanceStatusColor(currentStatus) : undefined;
                        return (
                          <Box key={`${c.id}-${h}`}>
                            {scheduleForThisTime ? (
                              <Tooltip title={getStudentName(scheduleForThisTime.studentId)} arrow>
                                <Card sx={{
                                  backgroundColor: getTeacherColor(scheduleForThisTime.teacherId),
                                  color: 'white',
                                  border: currentStatus ? `2px solid ${statusColor}` : '1px solid transparent',
                                  opacity: 1,
                                  position: 'relative',
                                }}>
                                  <CardContent sx={{ p: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:last-child': { pb: 0.3 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                                      {currentStatus && (
                                        <Tooltip title={getAttendanceStatusText(currentStatus)}>
                                          {renderStatusBadge(currentStatus as ChangeableStatus)}
                                        </Tooltip>
                                      )}
                                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.64rem' }, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', letterSpacing: 0.2 }}>
                                        {getResponsiveStudentLabel(scheduleForThisTime.studentId)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.2 }}>
                                      {currentStatus ? (
                                        <Tooltip title="Durumu değiştir">
                                          <IconButton size="small" onClick={() => openStatusChangeDialog(scheduleForThisTime, weekDates[dayIndex], currentStatus)} sx={{ color: 'white', p: 0.15 }}>
                                            <EditIcon sx={{ fontSize: '0.9rem' }} />
                                          </IconButton>
                                        </Tooltip>
                                      ) : (
                                        <>
                                          <Tooltip title="Dersi Tamamla">
                                            <IconButton size="small" onClick={() => handleMarkAttendance(scheduleForThisTime, 'COMPLETED', weekDates[dayIndex])} sx={{ color: 'white', p: 0.15 }}>
                                              <CheckCircleIcon sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Dersi İptal Et">
                                            <IconButton size="small" onClick={() => handleMarkAttendance(scheduleForThisTime, 'CANCELLED', weekDates[dayIndex])} sx={{ color: 'white', p: 0.15 }}>
                                              <CancelIcon sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="İnsiyatif">
                                            <IconButton size="small" onClick={() => handleMarkAttendance(scheduleForThisTime, 'RESCHEDULED', weekDates[dayIndex])} sx={{ color: 'white', p: 0.15 }}>
                                              <GavelIcon sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Dersi Yak">
                                            <IconButton size="small" onClick={() => handleMarkAttendance(scheduleForThisTime, 'ABSENT', weekDates[dayIndex])} sx={{ color: 'white', p: 0.15 }}>
                                              <PersonOffIcon sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                          </Tooltip>
                                        </>
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Tooltip>
                            ) : (
                              <Box sx={{ border: '1px dashed #eee', borderRadius: 1, height: '100%' }} />
                            )}
                          </Box>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Box>
              ))}
            </>
          );
        })()}
      </Paper>
    </Box>
  );

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
        key={teachers.length + '-' + students.length}
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
        lessonTypes={lessonTypes}
      />
      {/* Öğretmen renk legendi */}
      {renderTeacherLegend()}
      {/* Derslik seçimi kaldırıldı - tek tabloda tüm derslikler gösteriliyor */}
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
      {/* Tüm derslikleri tek tabloda göster */}
      {renderUnifiedWeeklyGrid()}
      {/* Lesson Form Dialog */}
      <LessonForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        schedule={editingSchedule}
        teachers={teachers}
        students={students}
        lessonTypes={lessonTypes}
        classrooms={classrooms}
      />
      {/* Status Change Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, schedule: null, date: null, current: null, selected: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Ders Durumunu Değiştir</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {statusDialog.schedule ? getStudentName(statusDialog.schedule.studentId) : ''}
          </Typography>
          <FormControl>
            <RadioGroup
              value={statusDialog.selected || ''}
              onChange={(e) => setStatusDialog(prev => ({ ...prev, selected: (e.target as HTMLInputElement).value as ChangeableStatus }))}
            >
              <FormControlLabel value="RESCHEDULED" control={<Radio />} label={getAttendanceActionLabel('RESCHEDULED')} />
              <FormControlLabel value="ABSENT" control={<Radio />} label={getAttendanceActionLabel('ABSENT')} />
              <FormControlLabel value="COMPLETED" control={<Radio />} label={getAttendanceActionLabel('COMPLETED')} />
              <FormControlLabel value="CANCELLED" control={<Radio />} label={getAttendanceActionLabel('CANCELLED')} />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, schedule: null, date: null, current: null, selected: null })}>Vazgeç</Button>
          <Button variant="contained" onClick={confirmStatusChange} disabled={!statusDialog.selected}>Kaydet</Button>
        </DialogActions>
      </Dialog>
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