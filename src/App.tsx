import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout';
import { Navigate } from 'react-router-dom';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import TeacherForm from './pages/TeacherForm';
import TeacherDetail from './pages/TeacherDetail';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import LessonTypes from './pages/LessonTypes';
import LessonTypeForm from './pages/LessonTypeForm';
import LessonAnalytics from './pages/LessonAnalytics';
import Schedule from './pages/Schedule';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/schedule" replace />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/teachers/new" element={<TeacherForm />} />
              <Route path="/teachers/edit/:id" element={<TeacherForm />} />
              <Route path="/teachers/:id" element={<TeacherDetail />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/edit/:id" element={<StudentForm />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/lesson-types" element={<LessonTypes />} />
              <Route path="/lesson-types/new" element={<LessonTypeForm />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/lesson-analytics" element={<LessonAnalytics />} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
