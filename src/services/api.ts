import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response error interceptor: extract backend message and propagate
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const backendMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || (typeof error?.response?.data === 'string' ? error.response.data : '')
        || error?.message
        || 'Beklenmeyen bir hata oluştu';
      const err: any = error || {};
      err.message = backendMessage;
      return Promise.reject(err);
    } catch (_) {
      return Promise.reject(error);
    }
  }
);

// Types
export interface Teacher {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  instrument?: string;
  experienceYears: number;
  bio: string;
  color?: string;
  notes?: string;
  // Optional relations/DTO fields
  lessonTypeIds?: number[];
  lessonTypes?: LessonType[];
}

// Teacher Note Types
export interface TeacherNote {
  id?: number;
  teacherId: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  instrument: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  parentName: string;
  parentPhone: string;
  secondParentName?: string;
  secondParentPhone?: string;
  notes: string;
  teacherId: number;
  teacherName?: string;
}

export interface TeacherWithStudents extends Teacher {
  students: Student[];
}



// Product Types
export interface Product {
  id?: number;
  name: string;
  description?: string;
  category: 'INSTRUMENT' | 'ACCESSORY' | 'BOOK' | 'EQUIPMENT' | 'OTHER';
  price: number;
  stockQuantity?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Pricing Types
export interface Pricing {
  id?: number;
  studentId: number;
  studentName?: string;
  lessonPrice: number;
  monthlyPrice: number;
  discountPercentage: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  paymentDay: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Sale Types
export interface SaleItem {
  productId: number;
  quantity: number;
  discountPercentage: number;
}

export interface Sale {
  id?: number;
  saleNumber: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  notes?: string;
  soldAt: string;
  createdAt?: string;
  items: SaleItem[];
}

// Lesson Payment Types
export interface LessonPayment {
  id?: number;
  studentId: number;
  paymentPeriod: string;
  paymentDate: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Lesson Schedule Types
export interface LessonSchedule {
  id?: number;
  studentId: number;
  teacherId: number;
  studentName?: string;
  teacherName?: string;
  lessonTypeId: number;
  lessonType: 'PIANO' | 'GUITAR' | 'VIOLIN' | 'DRUMS' | 'VOICE' | 'FLUTE' | 'OTHER';
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  classroomId: number; // <-- EKLENDİ
}

// Lesson Attendance Types
export interface LessonAttendance {
  id?: number;
  lessonScheduleId: number;
  lessonDate: string; // YYYY-MM-DD format
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'ABSENT' | 'RESCHEDULED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonAttendanceRequest {
  lessonScheduleId: number;
  lessonDate: string; // YYYY-MM-DD format
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'ABSENT' | 'RESCHEDULED';
  notes?: string;
}

export interface WeeklySchedule {
  monday: LessonSchedule[];
  tuesday: LessonSchedule[];
  wednesday: LessonSchedule[];
  thursday: LessonSchedule[];
  friday: LessonSchedule[];
  saturday: LessonSchedule[];
  sunday: LessonSchedule[];
}

// Financial Transaction Types
export interface FinancialTransaction {
  id?: number;
  transactionDate: string; // ISO date string
  amount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  category: 'LESSON_INCOME' | 'PRODUCT_SALE' | 'MONTHLY_PAYMENT' | 'OTHER_INCOME' | 
           'TEACHER_COMMISSION' | 'RENT' | 'UTILITIES' | 'EQUIPMENT' | 'MAINTENANCE' | 
           'SALARY' | 'MARKETING' | 'OTHER_EXPENSE';
  description: string;
  referenceId?: number;
  referenceType?: 'LESSON_ATTENDANCE' | 'SALE' | 'LESSON_PAYMENT' | 'MANUAL_ENTRY';
  studentId?: number;
  studentName?: string;
  teacherId?: number;
  teacherName?: string;
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFinancialTransactionRequest {
  transactionDate: string;
  amount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  referenceId?: number;
  referenceType?: string;
  studentId?: number;
  teacherId?: number;
  paymentMethod?: string;
  notes?: string;
}

// Lesson Type Types
export interface LessonType {
  id?: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Lesson Pricing Types
export interface LessonPricing {
  id?: number;
  lessonTypeId: number;
  lessonTypeName?: string;
  lessonPrice: number;
  teacherCommission: number;
  musicSchoolShare: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonPricingRequest {
  lessonTypeId: number;
  lessonPrice: number;
  teacherCommission: number;
  musicSchoolShare: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

// Teacher API
export const teacherAPI = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: number) => api.get<Teacher>(`/teachers/${id}`),
  getWithStudents: (id: number) => api.get<TeacherWithStudents>(`/teachers/${id}/with-students`),
  getByInstrument: (instrument: string) => api.get<Teacher[]>(`/teachers/instrument/${instrument}`),
  getByExperience: (minExperience: number) => api.get<Teacher[]>(`/teachers/experience/${minExperience}`),
  create: (teacher: Teacher) => api.post<Teacher>('/teachers', teacher),
  update: (id: number, teacher: Teacher) => api.put<Teacher>(`/teachers/${id}`, teacher),
  delete: (id: number) => api.delete(`/teachers/${id}`),
};

// Teacher Note API
export const teacherNoteAPI = {
  getByTeacherId: (teacherId: number) => api.get<TeacherNote[]>(`/teacher-notes/teacher/${teacherId}`),
  create: (note: { teacherId: number; content: string }) => api.post<TeacherNote>('/teacher-notes', note),
  update: (id: number, note: { content: string }) => api.put<TeacherNote>(`/teacher-notes/${id}`, note),
  delete: (id: number) => api.delete(`/teacher-notes/${id}`),
};

// Student API
export const studentAPI = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  getByTeacher: (teacherId: number) => api.get<Student[]>(`/students/teacher/${teacherId}`),
  getByInstrument: (instrument: string) => api.get<Student[]>(`/students/instrument/${instrument}`),
  getBySkillLevel: (skillLevel: string) => api.get<Student[]>(`/students/skill-level/${skillLevel}`),
  getByTeacherAndSkillLevel: (teacherId: number, skillLevel: string) =>
    api.get<Student[]>(`/students/teacher/${teacherId}/skill-level/${skillLevel}`),
  create: (student: Student) => api.post<Student>('/students', student),
  update: (id: number, student: Student) => api.put<Student>(`/students/${id}`, student),
  delete: (id: number) => api.delete(`/students/${id}`),
};

// Product API
export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  getByCategory: (category: Product['category']) => api.get<Product[]>(`/products/category/${category}`),
  search: (keyword: string) => api.get<Product[]>(`/products/search?keyword=${keyword}`),
  getLowStock: (threshold: number = 10) => api.get<Product[]>(`/products/low-stock?threshold=${threshold}`),
  create: (product: Product) => api.post<Product>('/products', product),
  update: (id: number, product: Product) => api.put<Product>(`/products/${id}`, product),
  delete: (id: number) => api.delete(`/products/${id}`),
  updateStock: (id: number, quantity: number) => api.patch(`/products/${id}/stock?quantity=${quantity}`),
};

// Pricing API
export const pricingAPI = {
  getAll: () => api.get<Pricing[]>('/pricing'),
  getById: (id: number) => api.get<Pricing>(`/pricing/${id}`),
  getByStudentId: (studentId: number) => api.get<Pricing>(`/pricing/student/${studentId}`),
  getByTeacherId: (teacherId: number) => api.get<Pricing[]>(`/pricing/teacher/${teacherId}`),
  getByMinPrice: (minPrice: number) => api.get<Pricing[]>(`/pricing/min-price/${minPrice}`),
  getByMaxPrice: (maxPrice: number) => api.get<Pricing[]>(`/pricing/max-price/${maxPrice}`),
  getByPaymentMethod: (paymentMethod: Pricing['paymentMethod']) => 
    api.get<Pricing[]>(`/pricing/payment-method/${paymentMethod}`),
  create: (pricing: Pricing) => api.post<Pricing>('/pricing', pricing),
  update: (id: number, pricing: Pricing) => api.put<Pricing>(`/pricing/${id}`, pricing),
  delete: (id: number) => api.delete(`/pricing/${id}`),
  deactivateByStudentId: (studentId: number) => api.delete(`/pricing/student/${studentId}`),
};

// Sale API
export const saleAPI = {
  getAll: () => api.get<Sale[]>('/sales'),
  getById: (id: number) => api.get<Sale>(`/sales/${id}`),
  getBySaleNumber: (saleNumber: string) => api.get<Sale>(`/sales/number/${saleNumber}`),
  getByCustomerId: (customerId: number) => api.get<Sale[]>(`/sales/customer/${customerId}`),
  getByStatus: (status: Sale['status']) => api.get<Sale[]>(`/sales/status/${status}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<Sale[]>(`/sales/date-range?startDate=${startDate}&endDate=${endDate}`),
  getTotalAmount: (startDate: string, endDate: string) => 
    api.get<number>(`/sales/total-amount?startDate=${startDate}&endDate=${endDate}`),
  getTotalCount: (startDate: string, endDate: string) => 
    api.get<number>(`/sales/total-count?startDate=${startDate}&endDate=${endDate}`),
  create: (sale: Sale) => api.post<Sale>('/sales', sale),
  cancel: (id: number) => api.post(`/sales/${id}/cancel`),
};

// Lesson Payment API
export const lessonPaymentAPI = {
  getAll: () => api.get<LessonPayment[]>('/lesson-payments'),
  getById: (id: number) => api.get<LessonPayment>(`/lesson-payments/${id}`),
  getByStudentId: (studentId: number) => api.get<LessonPayment[]>(`/lesson-payments/student/${studentId}`),
  getByStatus: (status: LessonPayment['status']) => api.get<LessonPayment[]>(`/lesson-payments/status/${status}`),
  getByPeriod: (paymentPeriod: string) => api.get<LessonPayment[]>(`/lesson-payments/period/${paymentPeriod}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<LessonPayment[]>(`/lesson-payments/date-range?startDate=${startDate}&endDate=${endDate}`),
  getByTeacherId: (teacherId: number) => api.get<LessonPayment[]>(`/lesson-payments/teacher/${teacherId}`),
  getTotalPaidAmount: (startDate: string, endDate: string) => 
    api.get<number>(`/lesson-payments/total-paid-amount?startDate=${startDate}&endDate=${endDate}`),
  getOverdueCount: () => api.get<number>('/lesson-payments/overdue-count'),
  createMonthlyPayment: (studentId: number, paymentPeriod: string) => 
    api.post<LessonPayment>(`/lesson-payments/student/${studentId}?paymentPeriod=${paymentPeriod}`),
  payMonthlyPayment: (paymentId: number) => api.post<LessonPayment>(`/lesson-payments/${paymentId}/pay`),
  payByStudentAndPeriod: (studentId: number, paymentPeriod: string) => 
    api.post<LessonPayment>(`/lesson-payments/student/${studentId}/period/${paymentPeriod}/pay`),
  markOverdue: () => api.post('/lesson-payments/mark-overdue'),
  generateMonthlyForAll: (paymentPeriod: string) => 
    api.post(`/lesson-payments/generate-monthly/${paymentPeriod}`),
};

// Lesson Schedule API
export const lessonScheduleAPI = {
  getAll: () => api.get<LessonSchedule[]>('/lesson-schedules'),
  getById: (id: number) => api.get<LessonSchedule>(`/lesson-schedules/${id}`),
  getByStudentId: (studentId: number) => api.get<LessonSchedule[]>(`/lesson-schedules/student/${studentId}`),
  getByTeacherId: (teacherId: number) => api.get<LessonSchedule[]>(`/lesson-schedules/teacher/${teacherId}`),
  getByDayOfWeek: (dayOfWeek: LessonSchedule['dayOfWeek']) => 
    api.get<LessonSchedule[]>(`/lesson-schedules/day/${dayOfWeek}`),
  getByLessonType: (lessonType: LessonSchedule['lessonType']) => 
    api.get<LessonSchedule[]>(`/lesson-schedules/type/${lessonType}`),
  getWeeklySchedule: () => api.get<WeeklySchedule>('/lesson-schedules/weekly'),
  getWeeklyScheduleByTeacher: (teacherId: number) => 
    api.get<WeeklySchedule>(`/lesson-schedules/weekly/teacher/${teacherId}`),
  getWeeklyScheduleByStudent: (studentId: number) => 
    api.get<WeeklySchedule>(`/lesson-schedules/weekly/student/${studentId}`),
  create: (schedule: LessonSchedule) => api.post<LessonSchedule>('/lesson-schedules', schedule),
  update: (id: number, schedule: LessonSchedule) => api.put<LessonSchedule>(`/lesson-schedules/${id}`, schedule),
  delete: (id: number) => api.delete(`/lesson-schedules/${id}`),
  deactivate: (id: number) => api.patch(`/lesson-schedules/${id}/deactivate`),
  activate: (id: number) => api.patch(`/lesson-schedules/${id}/activate`),
};

// Lesson Attendance API
export const lessonAttendanceAPI = {
  getAll: () => api.get<LessonAttendance[]>('/lesson_attendances'),
  getById: (id: number) => api.get<LessonAttendance>(`/lesson_attendances/${id}`),
  getByScheduleId: (lessonScheduleId: number) => 
    api.get<LessonAttendance[]>(`/lesson_attendances/schedule/${lessonScheduleId}`),
  getByStudentIdAndDateRange: (studentId: number, startDate: string, endDate: string) => 
    api.get<LessonAttendance[]>(`/lesson_attendances/student/${studentId}?startDate=${startDate}&endDate=${endDate}`),
  getByTeacherIdAndDateRange: (teacherId: number, startDate: string, endDate: string) => 
    api.get<LessonAttendance[]>(`/lesson_attendances/teacher/${teacherId}?startDate=${startDate}&endDate=${endDate}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<LessonAttendance[]>(`/lesson_attendances/date-range?startDate=${startDate}&endDate=${endDate}`),
  create: (request: CreateLessonAttendanceRequest) => api.post<LessonAttendance>('/lesson_attendances', request),
  update: (id: number, request: CreateLessonAttendanceRequest) => 
    api.put<LessonAttendance>(`/lesson_attendances/${id}`, request),
  delete: (id: number) => api.delete(`/lesson_attendances/${id}`),
};

// Financial Transaction API
export const financialTransactionAPI = {
  getAll: () => api.get<FinancialTransaction[]>('/financial-transactions'),
  getById: (id: number) => api.get<FinancialTransaction>(`/financial-transactions/${id}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<FinancialTransaction[]>(`/financial-transactions/date-range?startDate=${startDate}&endDate=${endDate}`),
  getByType: (transactionType: FinancialTransaction['transactionType']) => 
    api.get<FinancialTransaction[]>(`/financial-transactions/type/${transactionType}`),
  getByCategory: (category: FinancialTransaction['category']) => 
    api.get<FinancialTransaction[]>(`/financial-transactions/category/${category}`),
  getByStudentId: (studentId: number) => 
    api.get<FinancialTransaction[]>(`/financial-transactions/student/${studentId}`),
  getByTeacherId: (teacherId: number) => 
    api.get<FinancialTransaction[]>(`/financial-transactions/teacher/${teacherId}`),
  create: (transaction: CreateFinancialTransactionRequest) => 
    api.post<FinancialTransaction>('/financial-transactions', transaction),
  update: (id: number, transaction: CreateFinancialTransactionRequest) => 
    api.put<FinancialTransaction>(`/financial-transactions/${id}`, transaction),
  delete: (id: number) => api.delete(`/financial-transactions/${id}`),
  
  // Raporlama
  getTotalIncome: (startDate: string, endDate: string) => 
    api.get<number>(`/financial-transactions/reports/total-income?startDate=${startDate}&endDate=${endDate}`),
  getTotalExpense: (startDate: string, endDate: string) => 
    api.get<number>(`/financial-transactions/reports/total-expense?startDate=${startDate}&endDate=${endDate}`),
  getNetIncome: (startDate: string, endDate: string) => 
    api.get<number>(`/financial-transactions/reports/net-income?startDate=${startDate}&endDate=${endDate}`),
  getTeacherCommission: (teacherId: number, startDate: string, endDate: string) => 
    api.get<number>(`/financial-transactions/reports/teacher-commission/${teacherId}?startDate=${startDate}&endDate=${endDate}`),
  
  // Manuel işlemler
  createManualExpense: (transaction: CreateFinancialTransactionRequest) => 
    api.post<FinancialTransaction>('/financial-transactions/manual-expense', transaction),
  createManualIncome: (transaction: CreateFinancialTransactionRequest) => 
    api.post<FinancialTransaction>('/financial-transactions/manual-income', transaction),
};

// Lesson Type API
export const lessonTypeAPI = {
  getAll: () => api.get<LessonType[]>('/lesson-types'),
  getActive: () => api.get<LessonType[]>('/lesson-types/active'),
  getById: (id: number) => api.get<LessonType>(`/lesson-types/${id}`),
  create: (lessonType: LessonType) => api.post<LessonType>('/lesson-types', lessonType),
  update: (id: number, lessonType: LessonType) => api.put<LessonType>(`/lesson-types/${id}`, lessonType),
  delete: (id: number) => api.delete(`/lesson-types/${id}`),
};

// Lesson Pricing API
export const lessonPricingAPI = {
  getAll: () => api.get<LessonPricing[]>('/lesson-pricings'),
  getById: (id: number) => api.get<LessonPricing>(`/lesson-pricings/${id}`),
  getActive: () => api.get<LessonPricing[]>('/lesson-pricings/active'),
  getByLessonTypeId: (lessonTypeId: number) => api.get<LessonPricing[]>(`/lesson-pricings/lesson-type/${lessonTypeId}`),
  getActiveByLessonTypeId: (lessonTypeId: number) => api.get<LessonPricing[]>(`/lesson-pricings/lesson-type/${lessonTypeId}/active`),
  getByMinPrice: (minPrice: number) => api.get<LessonPricing[]>(`/lesson-pricings/min-price/${minPrice}`),
  getByMaxPrice: (maxPrice: number) => api.get<LessonPricing[]>(`/lesson-pricings/max-price/${maxPrice}`),
  create: (pricing: CreateLessonPricingRequest) => api.post<LessonPricing>('/lesson-pricings', pricing),
  update: (id: number, pricing: CreateLessonPricingRequest) => api.put<LessonPricing>(`/lesson-pricings/${id}`, pricing),
  delete: (id: number) => api.delete(`/lesson-pricings/${id}`),
  deactivateByLessonTypeId: (lessonTypeId: number) => api.delete(`/lesson-pricings/lesson-type/${lessonTypeId}/deactivate`),
};

export interface Classroom {
  id: number;
  name: string;
}

export const classroomAPI = {
  getAll: () => api.get<Classroom[]>('/classrooms'),
};

export default api; 