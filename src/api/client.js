import { api } from './http'

export const authApi = {
  register({ email, username, password, displayName }) {
    return api.post('/api/auth/register', { email, username, password, displayName }, { auth: false })
  },

  login({ login, password }) {
    return api.post('/api/auth/login', { login, password }, { auth: false })
  },

  logout(refreshToken) {
    return api.post('/api/auth/logout', { refreshToken }, { auth: false })
  },

  me() {
    return api.get('/api/me')
  },
}

export const accountApi = {
  updateProfile(payload) {
    return api.put('/api/me', payload)
  },

  changePassword({ currentPassword, newPassword }) {
    return api.post('/api/me/change-password', { currentPassword, newPassword })
  },
}