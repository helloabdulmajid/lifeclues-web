import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeContext'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute, GuestOnlyRoute } from './ui/RouteGuards'
import AppShell from './ui/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Journal from './pages/Journal'
import ProfileShell from './pages/ProfileShell'
import Profile from './pages/Profile'
import Security from './pages/Security'
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