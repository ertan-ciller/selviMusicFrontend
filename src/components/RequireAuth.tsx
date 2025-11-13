import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { authAPI } from '../services/api';

interface Props {
  children: React.ReactNode;
}

const RequireAuth: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authAPI.me()
      .then(() => {
        if (!cancelled) {
          setAllowed(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllowed(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;


