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
  CalendarToday as CalendarIcon,
  FamilyRestroom as FamilyIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI, Student, studentNoteAPI, StudentNote } from '../services/api';

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
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Veli Adı"
                    secondary={student.parentName || 'Belirtilmemiş'}
                  />
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
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="2. Veli Adı"
                        secondary={student.secondParentName || 'Belirtilmemiş'}
                      />
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