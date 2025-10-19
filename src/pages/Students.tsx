import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  Autocomplete,
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
  const [filterStudentName, setFilterStudentName] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
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
    const teacherMatch = filterTeacher ? student.teacherId.toString() === filterTeacher : true;
    const statusMatch = filterStatus ? (student.status || 'ACTIVE') === filterStatus : true;
    const nameQuery = filterStudentName.trim().toLowerCase();
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim().toLowerCase();
    const nameMatch = nameQuery ? fullName.includes(nameQuery) : true;
    return instrumentMatch && teacherMatch && statusMatch && nameMatch;
  });

  const instruments = Array.from(new Set(students.map(s => s.instrument)));
  // Seviye filtrelemesi kaldırıldı

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
      minWidth: 160,
      flex: 1.1,
    },
    {
      field: 'phoneNumber',
      headerName: 'Telefon',
      minWidth: 120,
      flex: 0.8,
    },
    // Doğum tarihi kolonu kaldırıldı (sayfaya sığması için)
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
      minWidth: 130,
      flex: 0.9,
      renderCell: (params) => (
        <Typography variant="body2">
          {getTeacherName(params.value)}
        </Typography>
      ),
    },
    {
      field: 'parentName',
      headerName: 'Veli Adı',
      minWidth: 110,
      flex: 0.7,
    },
    {
      field: 'secondParentName',
      headerName: '2. Veli Adı',
      minWidth: 110,
      flex: 0.7,
    },
    {
      field: 'notes',
      headerName: 'Notlar',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value?.substring(0, 50)}...
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      minWidth: 90,
      flex: 0.6,
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
      minWidth: 100,
      flex: 0.6,
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
            <Box flex={1} minWidth={220}>
              <Autocomplete
                freeSolo
                options={students.map(s => `${s.firstName} ${s.lastName}`.trim())}
                inputValue={filterStudentName}
                onInputChange={(_, newInput) => setFilterStudentName(newInput || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Öğrenci Adı" placeholder="İsim yazarak ara" />
                )}
              />
            </Box>
            <Box flex={1} minWidth={220}>
              <Autocomplete
                options={[{ value: '', label: 'Tümü' }, ...instruments.map(i => ({ value: i, label: i }))]}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(opt, val) => opt.value === val.value}
                value={({ value: filterInstrument, label: filterInstrument || 'Tümü' } as any)}
                onChange={(_, newVal) => setFilterInstrument(newVal ? newVal.value : '')}
                renderInput={(params) => (
                  <TextField {...params} label="Enstrüman" placeholder="Yazarak ara" />
                )}
              />
            </Box>
            <Box flex={1} minWidth={240}>
              <Autocomplete
                options={[{ id: 0, firstName: 'Tümü', lastName: '' } as any, ...teachers]}
                getOptionLabel={(t: any) => t.id === 0 ? 'Tümü' : `${t.firstName} ${t.lastName}`}
                isOptionEqualToValue={(opt: any, val: any) => opt.id === val.id}
                value={(filterTeacher ? teachers.find(t => t.id?.toString() === filterTeacher) : { id: 0, firstName: 'Tümü', lastName: '' }) as any}
                onChange={(_, newVal: any) => setFilterTeacher(newVal && newVal.id !== 0 ? String(newVal.id) : '')}
                renderInput={(params) => (
                  <TextField {...params} label="Öğretmen" placeholder="İsim yazarak ara" />
                )}
              />
            </Box>
            <Box flex={1} minWidth={200}>
              <Autocomplete
                options={[
                  { value: '', label: 'Tümü' },
                  { value: 'ACTIVE', label: 'Aktif' },
                  { value: 'PASSIVE', label: 'Pasif' },
                ]}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(opt, val) => opt.value === val.value}
                value={({ value: filterStatus, label: filterStatus === 'ACTIVE' ? 'Aktif' : filterStatus === 'PASSIVE' ? 'Pasif' : 'Tümü' } as any)}
                onChange={(_, newVal) => setFilterStatus(newVal ? newVal.value : '')}
                renderInput={(params) => (
                  <TextField {...params} label="Durum" placeholder="Yazarak ara" />
                )}
              />
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