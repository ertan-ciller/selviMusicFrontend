import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout';
import { Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
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
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#db6638',
      light: '#f08e69',
      dark: '#a64a24',
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
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/schedule" replace />} />
              <Route path="/teachers" element={<RequireAuth><Teachers /></RequireAuth>} />
              <Route path="/teachers/new" element={<RequireAuth><TeacherForm /></RequireAuth>} />
              <Route path="/teachers/edit/:id" element={<RequireAuth><TeacherForm /></RequireAuth>} />
              <Route path="/teachers/:id" element={<RequireAuth><TeacherDetail /></RequireAuth>} />
              <Route path="/students" element={<RequireAuth><Students /></RequireAuth>} />
              <Route path="/students/new" element={<RequireAuth><StudentForm /></RequireAuth>} />
              <Route path="/students/edit/:id" element={<RequireAuth><StudentForm /></RequireAuth>} />
              <Route path="/students/:id" element={<RequireAuth><StudentDetail /></RequireAuth>} />
              <Route path="/lesson-types" element={<RequireAuth><LessonTypes /></RequireAuth>} />
              <Route path="/lesson-types/new" element={<RequireAuth><LessonTypeForm /></RequireAuth>} />
              <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
              <Route path="/lesson-analytics" element={<RequireAuth><LessonAnalytics /></RequireAuth>} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
