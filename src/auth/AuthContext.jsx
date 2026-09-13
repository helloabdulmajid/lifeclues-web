import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authApi } from '../api/client'
import { ApiError, tokenStore } from '../api/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  // Restore the session on first load (silent; auto-refresh handled by http.js).
  // Transient network blips are retried a few times before giving up.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!tokenStore.accessToken()) {
        setStatus('anonymous')
        return
      }
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (cancelled) return
        try {
          const me = await authApi.me()
          if (!cancelled) {
            setUser(me)
            setStatus('authenticated')
          }
          return
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 0) {
            if (!cancelled) setStatus('anonymous')
            return
          }
          await new Promise((resolve) => setTimeout(resolve, 700))
        }
      }
      if (!cancelled) setStatus('anonymous')
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async ({ login, password }) => {
    const auth = await authApi.login({ login, password })
    tokenStore.save(auth)
    setUser(auth.user)
    setStatus('authenticated')
    return auth.user
  }, [])

  const register = useCallback(
    async ({ email, username, password, displayName }) => {
      await authApi.register({ email, username, password, displayName })
      const auth = await authApi.login({ login: username, password })
      tokenStore.save(auth)
      setUser(auth.user)
      setStatus('authenticated')
      return auth.user
    },
    [],
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.refreshToken()
    tokenStore.clear()
    setUser(null)
    setStatus('anonymous')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        /* best-effort revocation */
      }
    }
  }, [])

  const setProfile = useCallback((updatedUser) => setUser(updatedUser), [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      setProfile,
    }),
    [user, status, login, register, logout, setProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}