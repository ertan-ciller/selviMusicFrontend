import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  MusicNote as MusicIcon,
  TrendingUp as TrendingIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { 
  teacherAPI, 
  studentAPI, 
  productAPI, 
  pricingAPI, 
  saleAPI, 
  lessonPaymentAPI,
  Teacher, 
  Student,
  Product,
  Pricing,
  Sale,
  LessonPayment
} from '../services/api';

interface DashboardStats {
  totalTeachers: number;
  totalStudents: number;
  totalProducts: number;
  totalPricings: number;
  totalSales: number;
  totalPayments: number;
  instruments: string[];
  recentTeachers: Teacher[];
  recentStudents: Student[];
  recentProducts: Product[];
  pendingPayments: number;
  overduePayments: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          teachersResponse, 
          studentsResponse, 
          productsResponse, 
          pricingsResponse, 
          salesResponse, 
          paymentsResponse
        ] = await Promise.all([
          teacherAPI.getAll(),
          studentAPI.getAll(),
          productAPI.getAll(),
          pricingAPI.getAll(),
          saleAPI.getAll(),
          lessonPaymentAPI.getAll(),
        ]);

        const teachers = teachersResponse.data;
        const students = studentsResponse.data;
        const products = productsResponse.data;
        const pricings = pricingsResponse.data;
        const sales = salesResponse.data;
        const payments = paymentsResponse.data;

        // Enstrümanları topla
        const instruments = Array.from(
          new Set([
            ...teachers.map(t => t.instrument),
            ...students.map(s => s.instrument)
          ])
        );

        // Ödeme istatistikleri
        const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
        const overduePayments = payments.filter(p => p.status === 'OVERDUE').length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        setStats({
          totalTeachers: teachers.length,
          totalStudents: students.length,
          totalProducts: products.length,
          totalPricings: pricings.length,
          totalSales: sales.length,
          totalPayments: payments.length,
          instruments,
          recentTeachers: teachers.slice(0, 5),
          recentStudents: students.slice(0, 5),
          recentProducts: products.slice(0, 5),
          pendingPayments,
          overduePayments,
          totalRevenue,
        });
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Ana İstatistik Kartları */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Toplam Öğretmen"
            value={stats.totalTeachers}
            icon={<SchoolIcon sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Toplam Öğrenci"
            value={stats.totalStudents}
            icon={<PersonIcon sx={{ color: 'white' }} />}
            color="#dc004e"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Toplam Ürün"
            value={stats.totalProducts}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Toplam Satış"
            value={stats.totalSales}
            icon={<CartIcon sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Box>
      </Box>

      {/* Finansal İstatistikler */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Toplam Gelir"
            value={stats.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Bekleyen Ödemeler"
            value={stats.pendingPayments}
            icon={<PaymentIcon sx={{ color: 'white' }} />}
            color="#ff9800"
            subtitle="Ödenmemiş ders ücretleri"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Gecikmiş Ödemeler"
            value={stats.overduePayments}
            icon={<PaymentIcon sx={{ color: 'white' }} />}
            color="#f44336"
            subtitle="Vadesi geçmiş ödemeler"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard
            title="Aktif Ücretlendirme"
            value={stats.totalPricings}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color="#4caf50"
            subtitle="Öğrenci ücretlendirmeleri"
          />
        </Box>
      </Box>

      {/* Detay Kartları */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Enstrüman Türleri
            </Typography>
            <Box>
              {stats.instruments.map((instrument: string, index: number) => (
                <Box
                  key={instrument}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < stats.instruments.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Typography>{instrument}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.recentTeachers.filter((t: Teacher) => t.instrument === instrument).length} öğretmen
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Eklenen Ürünler
            </Typography>
            <Box>
              {stats.recentProducts.map((product: Product, index: number) => (
                <Box
                  key={product.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < stats.recentProducts.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.category}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Eklenen Öğretmenler
            </Typography>
            <Box>
              {stats.recentTeachers.map((teacher: Teacher, index: number) => (
                <Box
                  key={teacher.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < stats.recentTeachers.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      {teacher.firstName} {teacher.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {teacher.instrument}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {teacher.experienceYears} yıl
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 