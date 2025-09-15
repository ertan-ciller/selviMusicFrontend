import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { studentAPI, teacherAPI, Student, Teacher } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInstrument, setFilterInstrument] = useState<string>('');
  const [filterSkillLevel, setFilterSkillLevel] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, teachersResponse] = await Promise.all([
        studentAPI.getAll(),
        teacherAPI.getAll(),
      ]);
      setStudents(studentsResponse.data);
      setTeachers(teachersResponse.data);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Students fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu öğrenciyi pasif yapmak istediğinizden emin misiniz?')) {
      try {
        await studentAPI.delete(id);
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'PASSIVE' } : s));
      } catch (err) {
        setError('Öğrenci pasif yapılırken bir hata oluştu');
        console.error('Delete student (soft) error:', err);
      }
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/students/${id}`);
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Bilinmiyor';
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'BEGINNER': return 'error';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'info';
      case 'EXPERT': return 'success';
      default: return 'default';
    }
  };

  const getSkillLevelText = (skillLevel: string) => {
    switch (skillLevel) {
      case 'BEGINNER': return 'Başlangıç';
      case 'INTERMEDIATE': return 'Orta';
      case 'ADVANCED': return 'İleri';
      case 'EXPERT': return 'Uzman';
      default: return skillLevel;
    }
  };

  const filteredStudents = students.filter(student => {
    const instrumentMatch = filterInstrument ? student.instrument === filterInstrument : true;
    const skillMatch = filterSkillLevel ? student.skillLevel === filterSkillLevel : true;
    const teacherMatch = filterTeacher ? student.teacherId.toString() === filterTeacher : true;
    const statusMatch = filterStatus ? (student.status || 'ACTIVE') === filterStatus : true;
    return instrumentMatch && skillMatch && teacherMatch && statusMatch;
  });

  const instruments = Array.from(new Set(students.map(s => s.instrument)));
  const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 60,
      flex: 0.4,
    },
    {
      field: 'firstName',
      headerName: 'Ad',
      minWidth: 110,
      flex: 0.9,
    },
    {
      field: 'lastName',
      headerName: 'Soyad',
      minWidth: 110,
      flex: 0.9,
    },
    {
      field: 'email',
      headerName: 'E-posta',
      minWidth: 170,
      flex: 1.2,
    },
    {
      field: 'phoneNumber',
      headerName: 'Telefon',
      minWidth: 130,
      flex: 0.9,
    },
    {
      field: 'dateOfBirth',
      headerName: 'Doğum Tarihi',
      minWidth: 120,
      flex: 0.8,
      valueFormatter: (params: any) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString('tr-TR');
        }
        return '';
      },
    },
    {
      field: 'instrument',
      headerName: 'Enstrüman',
      minWidth: 110,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'skillLevel',
      headerName: 'Seviye',
      minWidth: 110,
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={getSkillLevelText(params.value)}
          size="small"
          color={getSkillLevelColor(params.value)}
        />
      ),
    },
    {
      field: 'teacherId',
      headerName: 'Öğretmen',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {getTeacherName(params.value)}
        </Typography>
      ),
    },
    {
      field: 'parentName',
      headerName: 'Veli Adı',
      minWidth: 120,
      flex: 0.8,
    },
    {
      field: 'secondParentName',
      headerName: '2. Veli Adı',
      minWidth: 120,
      flex: 0.8,
    },
    {
      field: 'notes',
      headerName: 'Notlar',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value?.substring(0, 50)}...
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={(params.value || 'ACTIVE') === 'ACTIVE' ? 'Aktif' : 'Pasif'}
          size="small"
          color={(params.value || 'ACTIVE') === 'ACTIVE' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      minWidth: 110,
      flex: 0.7,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Detay"
          onClick={() => handleViewDetails(params.row.id)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Düzenle"
          onClick={() => navigate(`/students/edit/${params.row.id}`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Sil"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  // Küçük ekranlarda daha az sütun göstererek yatay kaydırmayı engelle
  const columnVisibilityModel = {
    email: !isSmall,
    phoneNumber: !isSmall,
    dateOfBirth: !isSmall,
    parentName: !isSmall,
    secondParentName: !isSmall,
    notes: !isSmall,
  } as const;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Öğrenciler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/students/new')}
        >
          Yeni Öğrenci Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtreler */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={2} alignItems="center">
            <Box flex={1} minWidth={200}>
              <TextField
                select
                fullWidth
                label="Enstrümana Göre Filtrele"
                value={filterInstrument}
                onChange={(e) => setFilterInstrument(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {instruments.map((instrument) => (
                  <MenuItem key={instrument} value={instrument}>
                    {instrument}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex={1} minWidth={200}>
              <TextField
                select
                fullWidth
                label="Seviyeye Göre Filtrele"
                value={filterSkillLevel}
                onChange={(e) => setFilterSkillLevel(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {skillLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {getSkillLevelText(level)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex={1} minWidth={200}>
              <TextField
                select
                fullWidth
                label="Öğretmene Göre Filtrele"
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id ? teacher.id.toString() : ''}>
                    {teacher.firstName} {teacher.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex={1} minWidth={200}>
              <TextField
                select
                fullWidth
                label="Duruma Göre Filtrele"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="PASSIVE">Pasif</MenuItem>
              </TextField>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Toplam: {filteredStudents.length} öğrenci
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Öğrenciler Tablosu */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={filteredStudents}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={{ pageSize: 10, page: 0 }}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0',
              },
              width: '100%',
            }}
            columnVisibilityModel={columnVisibilityModel}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Students; 