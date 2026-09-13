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

  forgotPassword(email) {
    return api.post('/api/auth/forgot-password', { email }, { auth: false })
  },

  resetPassword({ token, newPassword }) {
    return api.post('/api/auth/reset-password', { token, newPassword }, { auth: false })
  },

  verifyEmail(token) {
    return api.post('/api/auth/verify-email', { token }, { auth: false })
  },

  resendVerification(email) {
    return api.post('/api/auth/resend-verification', { email }, { auth: false })
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

export const memoryApi = {
  list({ limit = 50, offset = 0 } = {}) {
    return api.get(`/api/memories?limit=${limit}&offset=${offset}`)
  },

  listTrashed({ limit = 50, offset = 0 } = {}) {
    return api.get(`/api/memories/trash?limit=${limit}&offset=${offset}`)
  },

  create(payload) {
    return api.post('/api/memories', payload)
  },

  update(id, payload) {
    return api.put(`/api/memories/${id}`, payload)
  },

  changeStatus(id, status) {
    return api.patch(`/api/memories/${id}/status`, { status })
  },

  trash(id) {
    return api.del(`/api/memories/${id}`)
  },

  restore(id) {
    return api.post(`/api/memories/${id}/restore`)
  },

  permanentDelete(id) {
    return api.del(`/api/memories/${id}/permanent`)
  },

  emptyTrash() {
    return api.del('/api/memories/trash')
  },
}