import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeContext'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute, GuestOnlyRoute } from './ui/RouteGuards'
import AppShell from './ui/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CheckEmail from './pages/CheckEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Journal from './pages/Journal'
import ProfileShell from './pages/ProfileShell'
import Profile from './pages/Profile'
import AppearanceTab from './pages/AppearanceTab'
import Security from './pages/Security'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <Register />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/check-email"
              element={
                <GuestOnlyRoute>
                  <CheckEmail />
                </GuestOnlyRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Journal />} />
              <Route path="profile" element={<ProfileShell />}>
                <Route index element={<Profile />} />
                <Route path="appearance" element={<AppearanceTab />} />
                <Route path="security" element={<Security />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App