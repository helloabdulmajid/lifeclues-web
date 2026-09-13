/* Thin wrapper around fetch() that talks to the LifeClues backend.
   - Attaches the Bearer access token.
   - Automatically refreshes on 401 (then retries once).
   - If refresh fails, clears the saved session -> UI redirects to /login.
   - Throws ApiError with `status`, `message` and optional `fieldErrors`
     (matches the backend's ApiError body). */

const TOKENS_KEY = 'lifeclues.tokens'

export class ApiError extends Error {
  constructor(status, message, fieldErrors = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const tokenStore = {
  read() {
    try {
      const raw = localStorage.getItem(TOKENS_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  save(auth) {
    try {
      localStorage.setItem(
        TOKENS_KEY,
        JSON.stringify({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        }),
      )
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKENS_KEY)
    } catch {
      /* ignore */
    }
  },
  accessToken() {
    return tokenStore.read()?.accessToken ?? null
  },
  refreshToken() {
    return tokenStore.read()?.refreshToken ?? null
  },
}

let refreshPromise = null

async function refreshTokens() {
  const refreshToken = tokenStore.refreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const res = await doFetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    tokenStore.clear()
    let message = 'Your session has expired. Please sign in again.'
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      /* ignore */
    }
    throw new ApiError(401, message)
  }

  const auth = await res.json()
  tokenStore.save(auth)
  return auth.accessToken
}

const NETWORK_ERROR_MESSAGE =
  "Can't reach the server. Please check your connection and try again."

async function doFetch(url, options, retries = 1) {
  try {
    return await fetch(url, options)
  } catch {
    if (retries > 0 && !options?.signal?.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return doFetch(url, options, retries - 1)
    }
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }
}

async function parseResponse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message || 'Something went wrong. Please try again.',
      data?.fieldErrors || null,
    )
  }

  return data
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = tokenStore.accessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res = await doFetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      headers['Authorization'] = `Bearer ${newToken}`
      res = await doFetch(path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }, 1)
    } catch (error) {
      // Only clear the saved session when the refresh was genuinely rejected
      // (a real HTTP response). A transient network blip keeps the tokens so
      // the user isn't logged out.
      if (!(error instanceof ApiError) || error.status !== 0) {
        tokenStore.clear()
      }
      throw new ApiError(
        error instanceof ApiError ? error.status : 401,
        error instanceof ApiError && error.message
          ? error.message
          : 'Your session has expired. Please sign in again.',
      )
    }
  }

  return parseResponse(res)
}

export const api = {
  get: (path) => request(path),
  post: (path, body, { auth = true } = {}) => request(path, { method: 'POST', body, auth }),
  put: (path, body) => request(path, { method: 'PUT', body }),
}