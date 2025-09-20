import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MusicNote as MusicNoteIcon,
  CalendarToday as CalendarIcon,
  FamilyRestroom as FamilyIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Paid as PaidIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI, Student, studentNoteAPI, StudentNote, lessonAttendanceAPI, LessonAttendance, smsAPI, SmsTargetParent } from '../services/api';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes (CRUD)
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [creatingNote, setCreatingNote] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // SMS state (per parent)
  const [sms1Message, setSms1Message] = useState<string>('');
  const [sms2Message, setSms2Message] = useState<string>('');
  const [sms1Sending, setSms1Sending] = useState<boolean>(false);
  const [sms2Sending, setSms2Sending] = useState<boolean>(false);
  const [sms1Error, setSms1Error] = useState<string | null>(null);
  const [sms2Error, setSms2Error] = useState<string | null>(null);
  const [sms1Success, setSms1Success] = useState<string | null>(null);
  const [sms2Success, setSms2Success] = useState<string | null>(null);

  // Attendance & Pricing state
  const [attendances, setAttendances] = useState<LessonAttendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultStart = `${yyyy}-${mm}-01`;
  const defaultEnd = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  useEffect(() => {
    if (id) {
      fetchStudentDetails(parseInt(id));
    }
  }, [id]);

  const fetchStudentDetails = async (studentId: number) => {
    try {
      setLoading(true);
      const response = await studentAPI.getById(studentId);
      setStudent(response.data);
      fetchNotes(studentId);
    } catch (err) {
      setError('Öğrenci bilgileri yüklenirken bir hata oluştu');
      console.error('Student details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Attendance fetch
  useEffect(() => {
    if (!id) return;
    fetchAttendances(parseInt(id), startDate, endDate);
  }, [id, startDate, endDate]);

  const fetchAttendances = async (studentId: number, start: string, end: string) => {
    try {
      setAttendanceError(null);
      setAttendanceLoading(true);
      const res = await lessonAttendanceAPI.getByStudentIdAndDateRange(studentId, start, end);
      setAttendances(res.data || []);
    } catch (err: any) {
      setAttendanceError(err?.message || 'Ders katılım bilgileri yüklenemedi');
      console.error('Fetch attendances error:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const markAttendancePaid = async (attendanceId: number) => {
    try {
      const res = await lessonAttendanceAPI.markAsPaid(attendanceId);
      const updated = res.data;
      setAttendances((prev) => prev.map((a) => (a.id === attendanceId ? { ...a, ...updated } : a)));
    } catch (err: any) {
      console.error('Mark as paid error:', err);
      alert(err?.message || 'Ödeme işaretlenemedi');
    }
  };

  const fetchNotes = async (studentId: number) => {
    try {
      setNotesError(null);
      setNotesLoading(true);
      const res = await studentNoteAPI.getByStudentId(studentId);
      setNotes(res.data || []);
    } catch (err) {
      setNotesError('Notlar yüklenemedi');
      console.error('Fetch student notes error:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!student?.id) return;
    const content = (newNote || '').trim();
    if (!content) return;
    try {
      setCreatingNote(true);
      const res = await studentNoteAPI.create({ studentId: student.id, content });
      setNewNote('');
      setNotes((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Create student note error:', err);
    } finally {
      setCreatingNote(false);
    }
  };

  const startEditNote = (note: StudentNote) => {
    setEditingNoteId(note.id!);
    setEditingContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleUpdateNote = async (id: number) => {
    const content = (editingContent || '').trim();
    if (!content) return;
    try {
      const res = await studentNoteAPI.update(id, { content });
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
      cancelEditNote();
    } catch (err) {
      console.error('Update student note error:', err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await studentNoteAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Delete student note error:', err);
    }
  };

  const sendSms = async (target: SmsTargetParent) => {
    if (!student?.id) return;
    const isFirst = target === 'PARENT1';
    const text = (isFirst ? sms1Message : sms2Message).trim();
    if (!text) {
      isFirst ? setSms1Error('Lütfen bir mesaj yazın') : setSms2Error('Lütfen bir mesaj yazın');
      return;
    }
    const hasTargetPhone = isFirst ? !!student.parentPhone : !!student.secondParentPhone;
    if (!hasTargetPhone) {
      isFirst ? setSms1Error('Seçilen veli için telefon bulunamadı') : setSms2Error('Seçilen veli için telefon bulunamadı');
      return;
    }
    try {
      if (isFirst) { setSms1Error(null); setSms1Success(null); setSms1Sending(true); }
      else { setSms2Error(null); setSms2Success(null); setSms2Sending(true); }
      await smsAPI.sendToStudentParent(student.id, target, text);
      isFirst ? setSms1Success('SMS gönderildi') : setSms2Success('SMS gönderildi');
    } catch (err: any) {
      isFirst ? setSms1Error(err?.message || 'SMS gönderilemedi') : setSms2Error(err?.message || 'SMS gönderilemedi');
    } finally {
      isFirst ? setSms1Sending(false) : setSms2Sending(false);
    }
  };

  // Helpers
  const formatDateTime24 = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString('tr-TR', { hour12: false });
  };
  const formatTimeHHMM = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const getSkillLevelLabel = (level: string) => {
    const levels = {
      'BEGINNER': 'Başlangıç',
      'INTERMEDIATE': 'Orta',
      'ADVANCED': 'İleri',
      'EXPERT': 'Uzman',
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'error';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'info';
      case 'EXPERT': return 'success';
      default: return 'default';
    }
  };

  // Attendance helpers and aggregates
  const formatDateYMDToTR = (ymd?: string) => {
    if (!ymd) return '';
    const d = new Date(ymd);
    if (Number.isNaN(d.getTime())) return ymd;
    return d.toLocaleDateString('tr-TR');
  };

  const getAttendanceStatusLabel = (status: LessonAttendance['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal';
      case 'ABSENT': return 'Devamsız';
      case 'RESCHEDULED': return 'Yeniden Planlandı';
      case 'SCHEDULED': return 'Planlandı';
      default: return status as string;
    }
  };

  const getAttendanceStatusColor = (status: LessonAttendance['status']) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'default';
      case 'ABSENT': return 'error';
      case 'RESCHEDULED': return 'warning';
      case 'SCHEDULED': return 'info';
      default: return 'default';
    }
  };

  const formatCurrencyTRY = (value?: number | null) => {
    if (value === undefined || value === null) return '—';
    try {
      return value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    } catch {
      return `${value} ₺`;
    }
  };

  const completedAttendances = attendances.filter((a) => a.status === 'COMPLETED');
  const cancelledAttendances = attendances.filter((a) => a.status === 'CANCELLED');
  const absentAttendances = attendances.filter((a) => a.status === 'ABSENT');
  const totalCompletedAmount = completedAttendances.reduce((sum, a) => sum + (a.lessonPrice || 0), 0);
  const totalPaidAmount = completedAttendances.filter((a) => a.isPaid).reduce((sum, a) => sum + (a.lessonPrice || 0), 0);
  const totalUnpaidAmount = totalCompletedAmount - totalPaidAmount;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Öğrenci bulunamadı'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/students')}
            sx={{ mr: 2 }}
          >
            Geri
          </Button>
          <Typography variant="h4">
            Öğrenci Detayları
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/students/edit/${student.id}`)}
        >
          Düzenle
        </Button>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Öğrenci Bilgileri */}
        <Box flex={{ xs: 'none', md: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mr: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {student.firstName} {student.lastName}
                  </Typography>
                  <Chip
                    label={student.instrument}
                    color="primary"
                    variant="outlined"
                    icon={<MusicNoteIcon />}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="E-posta"
                    secondary={student.email}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Telefon"
                    secondary={student.phoneNumber}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Doğum Tarihi"
                    secondary={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      <MusicNoteIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Seviye"
                    secondary={
                      <Chip
                        label={getSkillLevelLabel(student.skillLevel)}
                        size="small"
                        color={getSkillLevelColor(student.skillLevel)}
                      />
                    }
                  />
                </ListItem>
              </List>

              {student.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Notlar
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {student.notes}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Veli Bilgileri ve Öğretmen */}
        <Box flex={{ xs: 'none', md: 1 }}>
          <Card>
            <CardContent>
              {/* Veli Bilgileri */}
              <Box display="flex" alignItems="center" mb={2}>
                <FamilyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Veli Bilgileri
                </Typography>
              </Box>

              <List>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Veli Adı"
                    secondary={student.parentName || 'Belirtilmemiş'}
                    sx={{ flex: '0 0 260px', mr: 2 }}
                  />
                  <Box sx={{ flex: 2, width: '100%', minWidth: 420, maxWidth: 'unset' }}>
                    {sms1Error && (<Alert severity="error" sx={{ mb: 1 }}>{sms1Error}</Alert>)}
                    {sms1Success && (<Alert severity="success" sx={{ mb: 1 }}>{sms1Success}</Alert>)}
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={sms1Message}
                      onChange={(e) => setSms1Message(e.target.value)}
                      placeholder="1. veliye gönderilecek SMS mesajını yazın"
                    />
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        disabled={sms1Sending || !student.parentPhone || !sms1Message.trim()}
                        onClick={() => sendSms('PARENT1')}
                      >
                        1. Veliye SMS
                      </Button>
                    </Stack>
                  </Box>
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Veli Telefonu"
                    secondary={student.parentPhone || 'Belirtilmemiş'}
                  />
                </ListItem>

                {(student.secondParentName || student.secondParentPhone) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                    <ListItemText
                        primary="2. Veli Adı"
                        secondary={student.secondParentName || 'Belirtilmemiş'}
                        sx={{ flex: '0 0 260px', mr: 2 }}
                      />
                      <Box sx={{ flex: 2, width: '100%', minWidth: 420, maxWidth: 'unset' }}>
                        {sms2Error && (<Alert severity="error" sx={{ mb: 1 }}>{sms2Error}</Alert>)}
                        {sms2Success && (<Alert severity="success" sx={{ mb: 1 }}>{sms2Success}</Alert>)}
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          value={sms2Message}
                          onChange={(e) => setSms2Message(e.target.value)}
                          placeholder="2. veliye gönderilecek SMS mesajını yazın"
                        />
                        <Stack direction="row" spacing={1} mt={1}>
                          <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            disabled={sms2Sending || !student.secondParentPhone || !sms2Message.trim()}
                            onClick={() => sendSms('PARENT2')}
                          >
                            2. Veliye SMS
                          </Button>
                        </Stack>
                      </Box>
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <PhoneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="2. Veli Telefonu"
                        secondary={student.secondParentPhone || 'Belirtilmemiş'}
                      />
                    </ListItem>
                  </>
                )}
              </List>

              <Divider sx={{ my: 3 }} />

              {/* Öğretmen Bilgileri */}
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">
                  Öğretmen Bilgileri
                </Typography>
              </Box>

              {student.teacherId && student.teacherName ? (
                <Paper
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => navigate(`/teachers/${student.teacherId}`)}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {student.teacherName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Öğretmen ID: {student.teacherId}
                      </Typography>
                    </Box>
                    <Chip
                      label="Detayları Gör"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    Bu öğrencinin henüz öğretmeni atanmamış
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Ders Katılımı ve Ücretlendirme */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Ders Katılımı ve Ücretlendirme</Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} mb={2}>
              <TextField
                label="Başlangıç"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Bitiş"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => student?.id && fetchAttendances(student.id, startDate, endDate)}
              >
                Yenile
              </Button>
            </Stack>

            {/* Summary */}
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip label={`Tamamlanan: ${completedAttendances.length}`} color="success" variant="outlined" />
              <Chip label={`İptal: ${cancelledAttendances.length}`} variant="outlined" />
              <Chip label={`Devamsız: ${absentAttendances.length}`} color="error" variant="outlined" />
              <Chip label={`Tutar: ${formatCurrencyTRY(totalCompletedAmount)}`} color="primary" />
              <Chip label={`Ödenen: ${formatCurrencyTRY(totalPaidAmount)}`} color="success" />
              <Chip label={`Kalan: ${formatCurrencyTRY(totalUnpaidAmount)}`} color="warning" />
            </Box>

            {attendanceError && (
              <Alert severity="error" sx={{ mb: 2 }}>{attendanceError}</Alert>
            )}

            {attendanceLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Ders</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Not</TableCell>
                      <TableCell align="right">Ders Ücreti</TableCell>
                      <TableCell align="right">Öğretmen Payı</TableCell>
                      <TableCell align="right">Müzik Evi Payı</TableCell>
                      <TableCell align="center">Ödeme</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">Kayıt bulunamadı</TableCell>
                      </TableRow>
                    )}
                    {attendances.map((a) => {
                      const canPay = a.status === 'COMPLETED' && !a.isPaid;
                      return (
                        <TableRow key={a.id} hover>
                          <TableCell>{formatDateYMDToTR(a.lessonDate)}</TableCell>
                          <TableCell>{a.lessonTypeName || a.lessonTypeId || '—'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={getAttendanceStatusLabel(a.status)} color={getAttendanceStatusColor(a.status) as any} />
                          </TableCell>
                          <TableCell>{a.notes || '—'}</TableCell>
                          <TableCell align="right">{formatCurrencyTRY(a.lessonPrice)}</TableCell>
                          <TableCell align="right">{formatCurrencyTRY(a.teacherCommission)}</TableCell>
                          <TableCell align="right">{formatCurrencyTRY(a.musicSchoolShare)}</TableCell>
                          <TableCell align="center">
                            {a.status === 'COMPLETED' ? (
                              a.isPaid ? (
                                <Chip size="small" color="success" label={`Ödendi (${formatDateTime24(a.paymentDate)})`} />
                              ) : (
                                <Chip size="small" color="warning" label="Ödenmedi" />
                              )
                            ) : (
                              <Chip size="small" label="—" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {canPay && (
                              <Button size="small" startIcon={<PaidIcon />} onClick={() => markAttendancePaid(a.id!)}>
                                Ödeme Alındı
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Öğrenci Notları (Liste / Ekle / Düzenle / Sil) */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Öğrenci Notları
            </Typography>
            <Box display="flex" gap={1} alignItems="flex-start" mb={2}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Yeni not / hatırlatma ekleyin"
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNote} disabled={creatingNote || !newNote.trim()}>
                {creatingNote ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </Box>

            {notesError && (
              <Alert severity="error" sx={{ mb: 2 }}>{notesError}</Alert>
            )}
            {notesLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List>
                {notes.length === 0 && (
                  <Typography variant="body2" color="textSecondary">Henüz not bulunmuyor</Typography>
                )}
                {notes.map((note) => (
                  <ListItem key={note.id} alignItems="flex-start" sx={{ borderBottom: '1px solid #eee' }
                    } secondaryAction={
                      editingNoteId === note.id ? (
                        <Box>
                          <IconButton aria-label="kaydet" onClick={() => handleUpdateNote(note.id!)}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton aria-label="iptal" onClick={cancelEditNote}>
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box>
                          <IconButton aria-label="düzenle" onClick={() => startEditNote(note)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label="sil" onClick={() => handleDeleteNote(note.id!)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {formatTimeHHMM(note.createdAt) || '—'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={formatDateTime24(note.createdAt || note.updatedAt || '')}
                      secondary={
                        editingNoteId === note.id ? (
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">{note.content}</Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StudentDetail; 