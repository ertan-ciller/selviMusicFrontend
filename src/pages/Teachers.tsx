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
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, Teacher } from '../services/api';

const Teachers= () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [filterLessonType, setFilterLessonType] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAll();
      setTeachers(response.data);
    } catch (err) {
      setError('Öğretmenler yüklenirken bir hata oluştu');
      console.error('Teachers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) {
      try {
        await teacherAPI.delete(id);
        setTeachers(teachers.filter(teacher => teacher.id !== id));
      } catch (err) {
        setError('Öğretmen silinirken bir hata oluştu');
        console.error('Delete teacher error:', err);
      }
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/teachers/${id}`);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim().toLowerCase();
    const matchesName = filterName.trim() === ''
      ? true
      : fullName.includes(filterName.trim().toLowerCase());

    const matchesLessonType = filterLessonType === ''
      ? true
      : (teacher.lessonTypes || []).some((lt) => lt.name === filterLessonType);

    return matchesName && matchesLessonType;
  });

  const lessonTypeNames = Array.from(
    new Set(
      teachers.flatMap((t) => (t.lessonTypes || []).map((lt) => lt.name))
    )
  );

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
    },
    {
      field: 'firstName',
      headerName: 'Ad',
      width: 120,
    },
    {
      field: 'lastName',
      headerName: 'Soyad',
      width: 120,
    },
    {
      field: 'email',
      headerName: 'E-posta',
      width: 200,
    },
    {
      field: 'phoneNumber',
      headerName: 'Telefon',
      width: 150,
    },
    
    {
      field: 'lessonTypes',
      headerName: 'Ders Türleri',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.row.lessonTypes || []).map((lt: any) => (
            <Chip key={lt.id} label={lt.name} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: 'experienceYears',
      headerName: 'Deneyim (Yıl)',
      width: 130,
      type: 'number',
    },
    {
      field: 'bio',
      headerName: 'Biyografi',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value?.substring(0, 50)}...
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Detay"
          onClick={() => handleViewDetails(params.row.id)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Düzenle"
          onClick={() => navigate(`/teachers/edit/${params.row.id}`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Sil"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

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
          Öğretmenler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/teachers/new')}
        >
          Yeni Öğretmen Ekle
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
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
            <Box flexGrow={1}>
              <TextField
                fullWidth
                label="İsme Göre Ara"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Box>
            <Box flexGrow={1}>
              <TextField
                select
                fullWidth
                label="Ders Türüne Göre Filtrele"
                value={filterLessonType}
                onChange={(e) => setFilterLessonType(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {lessonTypeNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Toplam: {filteredTeachers.length} öğretmen
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Öğretmenler Tablosu */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={filteredTeachers}
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
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Teachers; 