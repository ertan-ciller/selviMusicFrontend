import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, Chip } from '@mui/material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { lessonAttendanceAPI, LessonAttendance } from '../services/api';

const today = new Date();

const formatISO = (d: Date) => format(d, 'yyyy-MM-dd');

const toDateTimeRange = (start: string, end: string) => ({
  startDateTime: `${start}T00:00:00`,
  endDateTime: `${end}T23:59:59`,
});

const presets = () => {
  const thisStart = startOfMonth(today);
  const thisEnd = endOfMonth(today);
  const prev = new Date(thisStart);
  prev.setMonth(prev.getMonth() - 1);
  const prevStart = startOfMonth(prev);
  const prevEnd = endOfMonth(prev);
  return [
    { key: 'this', label: 'Bu Ay', start: thisStart, end: thisEnd },
    { key: 'prev', label: 'Geçen Ay', start: prevStart, end: prevEnd },
  ];
};

const LessonAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(formatISO(startOfMonth(today)));
  const [endDate, setEndDate] = useState<string>(formatISO(endOfMonth(today)));
  const [attendances, setAttendances] = useState<LessonAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Attendances (primary endpoint, then fallback)
      let loadedAttendances: LessonAttendance[] = [];
      try {
        const attRes = await lessonAttendanceAPI.getByDateRange(startDate, endDate);
        loadedAttendances = attRes.data || [];
      } catch (e) {
        try {
          const allRes = await lessonAttendanceAPI.getAll();
          const start = new Date(startDate);
          const end = new Date(endDate);
          loadedAttendances = (allRes.data || []).filter((a: LessonAttendance) => {
            const d = new Date(a.lessonDate as any);
            return d >= start && d <= end;
          });
        } catch (_) {
        }
      }
      setAttendances(loadedAttendances);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const stats = useMemo(() => {
    const withinRange = attendances;
    const totalLessons = withinRange.length;
    const byStatus = withinRange.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    const paidCount = withinRange.filter(a => a.isPaid).length;
    const unpaidCount = withinRange.filter(a => a.status === 'COMPLETED' && !a.isPaid).length;
    const cancelledCount = byStatus['CANCELLED'] || 0;
    const absentCount = byStatus['ABSENT'] || 0;
    const rescheduledCount = byStatus['RESCHEDULED'] || 0;
    const completedCount = byStatus['COMPLETED'] || 0;
    const scheduledCount = byStatus['SCHEDULED'] || 0;
    // Only include lessons whose payment is marked as done
    const totalLessonIncome = withinRange
      .filter(a => a.isPaid)
      .reduce((sum, a) => sum + (a.lessonPrice || 0), 0);
    return {
      totalLessons,
      completedCount,
      scheduledCount,
      cancelledCount,
      absentCount,
      rescheduledCount,
      paidCount,
      unpaidCount,
      totalLessonIncome,
    };
  }, [attendances]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ders Analitiği</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 360 }}>
            <TextField
              fullWidth
              label="Başlangıç"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 360 }}>
            <TextField
              fullWidth
              label="Bitiş"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flex: '2 1 300px', minWidth: 240 }}>
            {presets().map(p => (
              <Chip
                key={p.key}
                label={p.label}
                color="primary"
                variant="outlined"
                onClick={() => {
                  setStartDate(formatISO(p.start));
                  setEndDate(formatISO(p.end));
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.totalLessons}</Typography>
          <Typography variant="body2" color="text.secondary">Toplam Ders</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.completedCount}</Typography>
          <Typography variant="body2" color="text.secondary">Tamamlanan</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.paidCount}</Typography>
          <Typography variant="body2" color="text.secondary">Ödemesi Yapılan</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.unpaidCount}</Typography>
          <Typography variant="body2" color="text.secondary">Ödenmemiş (Geç)</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, mt: 1 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.cancelledCount}</Typography>
          <Typography variant="body2" color="text.secondary">İptal</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.absentCount}</Typography>
          <Typography variant="body2" color="text.secondary">Devamsızlık</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">{stats.rescheduledCount}</Typography>
          <Typography variant="body2" color="text.secondary">İnsiyatif</Typography>
        </Paper>
      </Box>

      {/* Finansal özet bölümü kullanıcı talebiyle kaldırıldı */}

      {loading && (
        <Typography sx={{ mt: 2 }}>Yükleniyor...</Typography>
      )}
    </Box>
  );
};

export default LessonAnalytics;


