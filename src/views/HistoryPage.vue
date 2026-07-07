<template>
  <div class="history-page">
    <div class="history-bg"></div>

    <div class="history-layout">
      <button class="back-btn" @click="$router.push('/')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back</span>
      </button>

      <div class="history-header">
        <h1 class="history-title">Session History</h1>

        <div v-if="sessions.length > 0" class="history-stats-row">
          <div class="history-stat">
            <span class="history-stat-value">{{ streak }}</span>
            <span class="history-stat-label">day streak</span>
          </div>
          <div class="history-stat-divider"></div>
          <div class="history-stat">
            <span class="history-stat-value">{{ totalSessions }}</span>
            <span class="history-stat-label">sessions</span>
          </div>
          <div class="history-stat-divider"></div>
          <div class="history-stat">
            <span class="history-stat-value">{{ totalMinutes }}</span>
            <span class="history-stat-label">total min</span>
          </div>
        </div>
      </div>

      <div v-if="sessions.length === 0" class="history-empty">
        <span class="history-empty-icon">○</span>
        <p class="history-empty-text">No sessions yet.<br />Complete a focus session to see it here.</p>
      </div>

      <div v-else class="history-list">
        <div
          v-for="(s, i) in sessions"
          :key="s.date + '-' + i"
          class="history-item"
        >
          <div class="history-item-left">
            <span class="history-item-date">{{ formatDate(s.date) }}</span>
            <div class="history-item-meta">
              <span class="history-item-duration">{{ formatDuration(s.totalSeconds) }}</span>
              <span v-if="s.scene" class="history-item-dot">·</span>
              <span v-if="s.scene" class="history-item-scene">{{ s.scene }}</span>
            </div>
          </div>
          <div v-if="s.intention" class="history-item-intention">{{ s.intention }}</div>
        </div>
      </div>

      <button v-if="sessions.length > 0" class="clear-btn" @click="clearAll">
        <span>Clear history</span>
      </button>
    </div>

    <button
      class="bottom-action-btn parallax-toggle"
      :class="{ active: parallaxEnabled }"
      type="button"
      @click="parallaxEnabled = !parallaxEnabled"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span>Parallax</span>
    </button>
  </div>
</template>

<script>
import { getSessions, computeStreak, getTotalFocusMinutes, clearSessions } from '@/data/storage'

export default {
  name: 'HistoryPage',
  data() {
    return {
      sessions: [],
      parallaxX: 0,
      parallaxY: 0,
      parallaxEnabled: true,
    }
  },
  computed: {
    streak() {
      return computeStreak()
    },
    totalSessions() {
      return this.sessions.length
    },
    totalMinutes() {
      return getTotalFocusMinutes()
    },
  },
  methods: {
    formatDate(ts) {
      const d = new Date(ts)
      const now = new Date()
      const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
      const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (dateStr === today) return 'Today'
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (`${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}` === dateStr) return 'Yesterday'
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    formatDuration(secs) {
      if (!secs) return '0m'
      const m = Math.floor(secs / 60)
      const s = secs % 60
      if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
      return `${s}s`
    },
    clearAll() {
      if (confirm('Clear all session history?')) {
        clearSessions()
        this.sessions = []
      }
    },
    onMouseMove(e) {
      if (!this.parallaxEnabled) {
        this.parallaxX = 0
        this.parallaxY = 0
        return
      }
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      this.parallaxX = ((e.clientX - cx) / cx) * 30
      this.parallaxY = ((e.clientY - cy) / cy) * 30
    },
  },
  mounted() {
    this.sessions = getSessions()
    this._onMouseMove = this.onMouseMove.bind(this)
    document.addEventListener('mousemove', this._onMouseMove, { passive: true })
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this._onMouseMove)
  },
}
</script>

<style scoped>
.history-page {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  background: #08080c;
  color: #fff;
}

.history-page::-webkit-scrollbar {
  display: none;
}

.history-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 30% 20%, rgba(30, 60, 90, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 60% at 70% 80%, rgba(60, 40, 30, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.history-layout {
  position: relative;
  z-index: 2;
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  min-height: 100vh;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth);
  margin-bottom: 40px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.history-header {
  text-align: center;
  margin-bottom: 40px;
}

.history-title {
  font-size: 28px;
  font-weight: 200;
  letter-spacing: -0.5px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.85);
}

.history-stats-row {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding: 16px 32px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

.history-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.history-stat-value {
  font-size: 24px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
}

.history-stat-label {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

.history-stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
}

.history-empty-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.15);
}

.history-empty-text {
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  line-height: 1.7;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.2s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.history-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item-date {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.history-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
}

.history-item-dot {
  color: rgba(255, 255, 255, 0.15);
}

.history-item-scene {
  color: rgba(255, 255, 255, 0.35);
}

.history-item-intention {
  font-size: 13px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255, 255, 255, 0.3);
  max-width: 180px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-btn {
  display: block;
  margin: 32px auto 0;
  padding: 10px 24px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-weight: 300;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
}

.bottom-action-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s var(--transition-smooth);
}

.bottom-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.bottom-action-btn.parallax-toggle.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.bottom-action-btn.parallax-toggle.active svg {
  stroke: #fff;
}
</style>
