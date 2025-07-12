import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import TeacherForm from './pages/TeacherForm';
import StudentForm from './pages/StudentForm';
import Products from './pages/Products';
import Pricing from './pages/Pricing';
import Sales from './pages/Sales';
import LessonPayments from './pages/LessonPayments';
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/students" element={<Students />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/teachers/new" element={<TeacherForm />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/products" element={<Products />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/lesson-payments" element={<LessonPayments />} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
