const SESSIONS_KEY = 'deep-still-sessions'
const SCENE_ORDER_KEY = 'deep-still-scene-order'

/* ─── Sessions ─── */

export function getSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveSession(session) {
  const sessions = getSessions()
  sessions.unshift({
    ...session,
    date: session.date || Date.now(),
  })
  // Keep last 200 sessions
  if (sessions.length > 200) sessions.length = 200
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch { /* quota exceeded */ }
  return sessions
}

export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY)
}

/* ─── Streak ─── */

export function computeStreak() {
  const sessions = getSessions()
  if (!sessions.length) return 0

  const dateSet = new Set()
  for (const s of sessions) {
    const d = new Date(s.date)
    dateSet.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)
  }
  const dates = [...dateSet].sort().reverse()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`

  // Streak only counts if most recent session is today or yesterday
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24))
    if (diff === 1) streak++
    else break
  }
  return streak
}

export function getTotalFocusMinutes() {
  const sessions = getSessions()
  return sessions.reduce((sum, s) => sum + Math.round((s.totalSeconds || 0) / 60), 0)
}

/* ─── Scene order ─── */

export function getSceneOrder() {
  try {
    const raw = localStorage.getItem(SCENE_ORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setSceneOrder(ids) {
  try {
    localStorage.setItem(SCENE_ORDER_KEY, JSON.stringify(ids))
  } catch { /* ignore */ }
}

/* ─── Custom uploads ─── */

const UPLOADS_KEY = 'deep-still-uploads'

export function getCustomUploads() {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

let uploadIdCounter = Date.now()

export function saveCustomUpload(dataUrl) {
  const uploads = getCustomUploads()
  const id = `custom-${++uploadIdCounter}`
  const label = `Custom ${uploads.length + 1}`
  // Store raw data URL + metadata separately; CSS wrapper is applied at use time
  uploads.push({ id, label, dataUrl })
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads))
  } catch { /* quota exceeded */ }
  return { id, label, dataUrl }
}

export function deleteCustomUpload(id) {
  const uploads = getCustomUploads().filter(u => u.id !== id)
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads))
  } catch { /* ignore */ }
  return uploads
}

export function renameCustomUpload(id, newLabel) {
  const uploads = getCustomUploads()
  const found = uploads.find(u => u.id === id)
  if (!found) return uploads
  found.label = newLabel.trim().slice(0, 40) || found.label
  try {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads))
  } catch { /* ignore */ }
  return uploads
}
