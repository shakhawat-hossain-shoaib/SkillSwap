import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Signup } from './pages/auth/Signup';
import { Login } from './pages/auth/Login';
import { OnboardingProfile } from './pages/onboarding/OnboardingProfile';
import { OnboardingSkills } from './pages/onboarding/OnboardingSkills';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { CourseList } from './pages/courses/CourseList';
import { CommunityPage } from './pages/community/CommunityPage';
import { BootcampList } from './pages/bootcamp/BootcampList';
import { BootcampDetail } from './pages/bootcamp/BootcampDetail';
import { LessonView } from './pages/bootcamp/LessonView';
import { ExchangeRequests } from './pages/exchange/ExchangeRequests';
import { ExchangeChat } from './pages/exchange/ExchangeChat';
import { MessagesPage } from './pages/messages/MessagesPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';
import { SwapAIAssistant } from './components/ai/SwapAIAssistant';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Authentication Routes - Always starts from Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Portal Route - Accessible at /admin with dedicated sign-in & .env credentials */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Protected Routes - Appears only when the user is logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/bootcamps" element={<BootcampList />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<BootcampDetail />} />
        <Route path="/courses/:id/lessons/:lessonId" element={<LessonView />} />
        <Route path="/bootcamps/:id" element={<BootcampDetail />} />
        <Route path="/bootcamps/:id/lessons/:lessonId" element={<LessonView />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/exchanges" element={<ExchangeRequests />} />
        <Route path="/exchanges/:id/chat" element={<ExchangeChat />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding/profile" element={<OnboardingProfile />} />
        <Route path="/onboarding/skills" element={<OnboardingSkills />} />
      </Route>

      {/* Fallback to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <SwapAIAssistant />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                className: 'dark:!bg-slate-900 dark:!text-slate-100 dark:!border dark:!border-slate-800 shadow-xl rounded-xl text-sm font-medium',
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;

