import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
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
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherAPI, Teacher, Student, financialTransactionAPI, FinancialTransaction, teacherNoteAPI, TeacherNote, lessonAttendanceAPI, LessonAttendance } from '../services/api';

interface TeacherWithStudents extends Teacher {
  students: Student[];
}

const TeacherDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherWithStudents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes (CRUD)
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [creatingNote, setCreatingNote] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

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

  // Transactions
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Advance form removed

  useEffect(() => {
    if (id) {
      fetchTeacherDetails(parseInt(id));
    }
  }, [id]);

  const fetchTeacherDetails = async (teacherId: number) => {
    try {
      setLoading(true);
      const response = await teacherAPI.getWithStudents(teacherId);
      setTeacher(response.data);
      // Fetch transactions
      fetchTransactions(teacherId);
      // Fetch notes
      fetchNotes(teacherId);
    } catch (err) {
      setError('Öğretmen bilgileri yüklenirken bir hata oluştu');
      console.error('Teacher details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (teacherId: number) => {
    try {
      setTransactionsError(null);
      setTransactionsLoading(true);
      const res = await financialTransactionAPI.getByTeacherId(teacherId);
      const list = (res.data || []).slice().sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''));
      setTransactions(list);
    } catch (err) {
      setTransactionsError('İşlemler yüklenemedi');
      console.error('Fetch transactions error:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Attendance & Summary (Teacher-centric)
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
    if (!id) return;
    fetchAttendances(parseInt(id), startDate, endDate);
  }, [id, startDate, endDate]);

  const fetchAttendances = async (teacherId: number, start: string, end: string) => {
    try {
      setAttendanceError(null);
      setAttendanceLoading(true);
      const res = await lessonAttendanceAPI.getByTeacherIdAndDateRange(teacherId, start, end);
      setAttendances(res.data || []);
    } catch (err: any) {
      setAttendanceError(err?.message || 'Ders katılım bilgileri yüklenemedi');
      console.error('Fetch teacher attendances error:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

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
  const totalTeacherCommission = completedAttendances.reduce((sum, a) => sum + (a.teacherCommission || 0), 0);

  const fetchNotes = async (teacherId: number) => {
    try {
      setNotesError(null);
      setNotesLoading(true);
      const res = await teacherNoteAPI.getByTeacherId(teacherId);
      setNotes(res.data || []);
    } catch (err) {
      setNotesError('Notlar yüklenemedi');
      console.error('Fetch teacher notes error:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!teacher?.id) return;
    const content = (newNote || '').trim();
    if (!content) return;
    try {
      setCreatingNote(true);
      const res = await teacherNoteAPI.create({ teacherId: teacher.id, content });
      setNewNote('');
      setNotes((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Create teacher note error:', err);
    } finally {
      setCreatingNote(false);
    }
  };

  const startEditNote = (note: TeacherNote) => {
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
      const res = await teacherNoteAPI.update(id, { content });
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
      cancelEditNote();
    } catch (err) {
      console.error('Update teacher note error:', err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await teacherNoteAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Delete teacher note error:', err);
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !teacher) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Öğretmen bulunamadı'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teachers')}
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
            onClick={() => navigate('/teachers')}
            sx={{ mr: 2 }}
          >
            Geri
          </Button>
          <Typography variant="h4">
            Öğretmen Detayları
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/teachers/edit/${teacher.id}`)}
        >
          Düzenle
        </Button>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Öğretmen Bilgileri */}
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
                  <SchoolIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {teacher.firstName} {teacher.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(teacher.lessonTypes || []).map((lt) => (
                      <Chip key={lt.id} label={lt.name} color="primary" variant="outlined" icon={<MusicNoteIcon />} />
                    ))}
                  </Box>
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
                    secondary={teacher.email}
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
                    secondary={teacher.phoneNumber}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <WorkIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Deneyim"
                    secondary={`${teacher.experienceYears} yıl`}
                  />
                </ListItem>
              </List>

              {teacher.bio && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Biyografi
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {teacher.bio}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Öğrenciler */}
        <Box flex={{ xs: 'none', md: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Öğrenciler ({teacher.students?.length || 0})
                </Typography>
              </Box>

              {teacher.students && teacher.students.length > 0 ? (
                <List>
                  {teacher.students.map((student) => (
                    <ListItem
                      key={student.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {student.instrument} • {getSkillLevelLabel(student.skillLevel)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {student.phoneNumber}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={getSkillLevelLabel(student.skillLevel)}
                        size="small"
                        color={
                          student.skillLevel === 'BEGINNER' ? 'default' :
                          student.skillLevel === 'INTERMEDIATE' ? 'primary' :
                          student.skillLevel === 'ADVANCED' ? 'secondary' : 'success'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    Bu öğretmenin henüz öğrencisi bulunmuyor
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Öğretmen Notları (Liste / Ekle / Düzenle / Sil) */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Öğretmen Notları
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
                  <ListItem key={note.id} alignItems="flex-start" sx={{ borderBottom: '1px solid #eee' }}
                    secondaryAction={
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

      {/* Ders Katılımı ve Ücretlendirme (Öğretmen) */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Ders Katılımı ve Ücretlendirme</Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip label={`Tamamlanan: ${completedAttendances.length}`} color="success" variant="outlined" />
              <Chip label={`İptal: ${cancelledAttendances.length}`} variant="outlined" />
              <Chip label={`Devamsız: ${absentAttendances.length}`} color="error" variant="outlined" />
              <Chip label={`Toplam Tutar: ${formatCurrencyTRY(totalCompletedAmount)}`} color="primary" />
              <Chip label={`Öğretmen Ücreti: ${formatCurrencyTRY(totalTeacherCommission)}`} color="success" />
            </Box>

            <Box display="flex" gap={2} alignItems={{ xs: 'stretch', md: 'center' }} mb={2}>
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
                onClick={() => teacher?.id && fetchAttendances(teacher.id, startDate, endDate)}
              >
                Yenile
              </Button>
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Tarih</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Ders</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Durum</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Not</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Ders Ücreti</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Öğretmen Ücreti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 12 }}>Kayıt bulunamadı</td>
                      </tr>
                    )}
                    {attendances.map((a) => (
                      <tr key={a.id}>
                        <td style={{ padding: 8 }}>{formatDateYMDToTR(a.lessonDate)}</td>
                        <td style={{ padding: 8 }}>{a.lessonTypeName || a.lessonTypeId || '—'}</td>
                        <td style={{ padding: 8 }}>
                          <Chip size="small" label={getAttendanceStatusLabel(a.status)} color={getAttendanceStatusColor(a.status) as any} />
                        </td>
                        <td style={{ padding: 8 }}>{a.notes || '—'}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrencyTRY(a.lessonPrice)}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrencyTRY(a.teacherCommission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* İşlemler Listesi - sadece kayıt varsa göster */}
      {transactions.length > 0 && (
        <Box mt={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Öğretmenle İlgili İşlemler
              </Typography>
              <List>
                {transactions.map((t) => (
                  <ListItem key={t.id} sx={{ borderBottom: '1px solid #eee' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: t.transactionType === 'INCOME' ? 'success.main' : 'error.main' }}>
                        <AttachMoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${t.description || 'İşlem'} — ₺${t.amount?.toFixed?.(2) ?? t.amount}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(t.transactionDate).toLocaleDateString()} • {t.category} • {t.paymentMethod || '—'}
                          </Typography>
                          {t.notes && (
                            <Typography variant="body2" color="textSecondary">{t.notes}</Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default TeacherDetail; 