<template>
  <div class="focus-page">
    <div v-if="!isRunning" class="background-choose">
      <div class="bkg-pill" role="tablist" aria-label="Background type">
        <div
          class="bkg-choice"
          role="tab"
          :aria-selected="backgroundType === 'solid'"
          @click="setBackground('solid')"
        >
          {{ t('modeSolid') }}
        </div>
        <div class="bkg-divider" aria-hidden="true"></div>
        <div
          class="bkg-choice"
          role="tab"
          :aria-selected="backgroundType === 'scene'"
          @click="setBackground('scene')"
        >
          {{ t('modeScene') }}
        </div>
      </div>
    </div>

    <div class="focus-bg" ref="bgContainer">
      <div class="focus-bg-gradient" :style="{ background: currentScene.gradient }"></div>
      <div
        class="focus-bg-photo"
        :class="{ 'photo-loaded': photoLoaded }"
        :style="photoStyleWithParallax"
      ></div>
      <div
        class="focus-bg-veil"
        :style="veilStyleWithParallax"
      ></div>
      <div v-if="backgroundType === 'scene' && selectedImageAuthor" class="scene-author">{{ t('shotBy', { author: selectedImageAuthor }) }}</div>
    </div>

    <div class="focus-layout">
      <div class="bottom-actions">
        <div v-if="backgroundType === 'scene'" class="bottom-actions-left">
          <button class="bottom-action-btn" type="button" @click="selectPhoto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{{ t('photographic') }}</span>
          </button>
          <button v-if="selectedImage" class="bottom-action-btn" type="button" @click="isAdjustPanelOpen = !isAdjustPanelOpen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{{ t('adjust') }}</span>
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
          <span>{{ t('parallax') }}</span>
        </button>
      </div>

      <button class="exit-btn" @click="exitFocus">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div class="focus-center" :style="focusCenterParallaxStyle">
        <div class="timer-card" :class="{ 'layout-scene': backgroundType === 'scene' && photoLoaded, running: isRunning, completed: isCompleted }">

          <div class="duration-collapse" :class="{ collapsed: isRunning || isCompleted }">
            <div class="duration-collapse-inner">
              <div class="duration-selector">
                <span class="duration-label">{{ t('sessionLength') }}</span>
                <div class="duration-options">
                  <button
                    v-for="d in durations"
                    :key="d.value"
                    class="duration-chip"
                    :class="{ active: selectedDuration === d.value && !isCustom }"
                    @click="pickPreset(d)"
                  >
                    {{ d.label }}
                  </button>
                  <div class="duration-chip custom-chip" :class="{ active: isCustom }">
                    <input
                      v-if="isCustom"
                      ref="customInput"
                      v-model.number="customMinutes"
                      type="number"
                      min="1"
                      max="999"
                      class="custom-input"
                      @blur="commitCustom"
                      @keydown.enter="commitCustom"
                    />
                    <button
                      v-else
                      class="custom-trigger"
                      @click="openCustom"
                    >
                      {{ t('custom') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="intention-collapse" :class="{ collapsed: isRunning || isCompleted }">
            <div class="intention-collapse-inner">
              <div class="intention-box">
                <input
                  v-model="intention"
                  class="intention-input"
                  :placeholder="t('intentionPlaceholder')"
                  maxlength="80"
                  @keydown.enter="$refs.startBtn?.focus()"
                />
              </div>
            </div>
          </div>

          <div class="timer-display">
            <div class="timer-digits" :class="{ 'timer-completed': isCompleted, 'timer-entering': isStarting }">
              <template v-if="!isCompleted">
                <span class="timer-number">{{ displayMinutes }}</span>
                <span class="timer-colon">:</span>
                <span class="timer-number">{{ displaySeconds }}</span>
              </template>
              <template v-else-if="isCompleted && !sessionStats">
                <div class="completed-message">
                  <span class="completed-icon">○</span>
                  <span class="completed-text">{{ t('sessionComplete') }}</span>
                </div>
              </template>
            </div>

            <div class="timer-progress">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <p class="motivational-text">{{ displayedText }}</p>

          <div class="timer-controls">
            <transition name="fade" mode="out-in">
              <div v-if="!isRunning && !isCompleted" key="idle">
                <button ref="startBtn" class="control-btn primary" @click="startTimer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>{{ t('start') }}</span>
                </button>
              </div>

              <div v-else-if="isRunning && !isCompleted" key="active">
                <button class="control-btn" @click="pauseTimer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>{{ t('pause') }}</span>
                </button>
                <button class="control-btn ghost" @click="resetTimer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>

              <div v-else-if="isCompleted" key="done">
                <button class="control-btn primary" @click="startTimer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>{{ t('newSession') }}</span>
                </button>
                <button class="control-btn ghost" @click="exitFocus">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <ImagePickerModal
      v-if="isImagePickerOpen"
      :show="isImagePickerOpen"
      @close="closeImagePicker"
      @select="handleImagePicked"
    />

    <transition name="fade-scale">
      <div
        v-if="isAdjustPanelOpen"
        class="adjust-overlay"
        @click.self="isAdjustPanelOpen = false"
      >
        <div class="adjust-panel">
          <div class="adjust-panel-header">
            <span class="adjust-panel-title">{{ t('imageAdjustments') }}</span>
            <button class="adjust-close" type="button" @click="isAdjustPanelOpen = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="adjust-panel-body">
            <div class="adjust-row">
              <div class="adjust-row-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                </svg>
                <span>{{ t('brightness') }}</span>
              </div>
              <div class="adjust-row-control">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  class="glass-slider"
                  v-model.number="bgBrightness"
                />
                <span class="adjust-value">{{ bgBrightness }}%</span>
              </div>
            </div>
            <div class="adjust-row">
              <div class="adjust-row-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3v18" />
                  <path d="M8 8l4-4 4 4" />
                  <path d="M8 16l4 4 4-4" />
                </svg>
                <span>{{ t('blur') }}</span>
              </div>
              <div class="adjust-row-control">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  class="glass-slider"
                  v-model.number="bgBlur"
                />
                <span class="adjust-value">{{ bgBlur }}px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isFullscreen" class="fullscreen-hint" key="fs-hint">
        {{ t('exitFullscreen', { key: 'F11' }) }}
      </div>
    </transition>

    <transition name="ritual-fade">
      <div v-if="ritualActive" class="ritual-overlay" key="ritual">
        <div class="ritual-breath-ring" :class="ritualPhase === 0 ? 'inhale' : 'exhale'">
          <div class="ritual-ring-inner"></div>
        </div>
        <p class="ritual-text" :key="ritualText">{{ ritualText }}</p>
      </div>
    </transition>

    <transition name="fade-scale">
      <div v-if="sessionStats" class="stats-overlay" @click.self="sessionStats = null">
        <div class="stats-card">
          <div class="stats-header">
            <span class="stats-icon">○</span>
            <span class="stats-title">{{ t('sessionComplete') }}</span>
          </div>

          <div class="stats-metrics">
            <div class="stats-metric">
              <span class="stats-metric-label">{{ t('duration') }}</span>
              <span class="stats-metric-value">{{ statsDuration }}</span>
            </div>
            <div class="stats-divider"></div>
            <div class="stats-metric">
              <span class="stats-metric-label">{{ t('scene') }}</span>
              <span class="stats-metric-value">{{ sessionStats.scene }}</span>
            </div>
            <div class="stats-divider"></div>
            <div class="stats-metric">
              <span class="stats-metric-label">{{ t('date') }}</span>
              <span class="stats-metric-value">{{ statsDate }}</span>
            </div>
          </div>

          <div v-if="sessionStats.intention" class="stats-intention">
            <span class="stats-intention-label">{{ t('intention') }}</span>
            <p class="stats-intention-text">{{ sessionStats.intention }}</p>
          </div>

          <div class="stats-actions">
            <button class="stats-btn primary" @click="copyStats">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{{ copied ? t('copied') : t('copySummary') }}</span>
            </button>
            <div class="stats-actions-row">
              <button class="stats-btn" @click="newSession">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>{{ t('newSession') }}</span>
              </button>
              <button class="stats-btn ghost" @click="exitFocus">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>{{ t('close') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { $t } from '@/data/i18n'
import { scenes, defaultMotivationalTexts, focusDurations } from '@/data/scenes'
import { samples } from '@/data/samples'
import { saveSession } from '@/data/storage'
import ImagePickerModal from '@/components/ImagePickerModal.vue'

export default {
  name: 'FocusPage',
  components: {
    ImagePickerModal,
  },
  data() {
    return {
      scenes,
      durations: focusDurations,
      selectedDuration: 25,
      totalSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      backgroundType: 'solid',
      isRunning: false,
      isCompleted: false,
      isStarting: false,
      isFullscreen: false,
      timerInterval: null,
      isImagePickerOpen: false,
      selectedImage: '',
      selectedImageAuthor: '',
      selectedSceneName: '',      bgBlur: 0,
      bgBrightness: 80,
      photoLoaded: false,
      photoLoadTimer: null,
      preloadImage: null,
      isAdjustPanelOpen: false,
      isCustom: false,
      customMinutes: 30,
      motivationalText: '',
      displayedText: '',
      ritualActive: false,
      ritualPhase: 0,
      ritualText: '',
      ritualTimer1: null,
      ritualTimer2: null,
      intention: '',
      sessionStats: null,
      copied: false,
      parallaxX: 0,
      parallaxY: 0,
      parallaxEnabled: true,
    }
  },
  computed: {
    t() {
      return (key, params) => $t(key, params)
    },
    currentScene() {
      const sceneId = this.$route.query.scene || 'lake'
      return this.scenes.find(s => s.id === sceneId) || this.scenes[0]
    },
    displayMinutes() {
      return String(Math.floor(this.remainingSeconds / 60)).padStart(2, '0')
    },
    displaySeconds() {
      return String(this.remainingSeconds % 60).padStart(2, '0')
    },
    progressPercent() {
      return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100
    },
    photoStyle() {
      if (!this.selectedImage) return null
      if (typeof this.selectedImage === 'object') return { ...this.selectedImage }
      return {
        background: this.selectedImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    },
    photoStyleWithParallax() {
      const base = this.photoStyle || {}
      if (!this.selectedImage || !this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) return base
      return {
        ...base,
        transform: `translate(${this.parallaxX}px, ${this.parallaxY}px) scale(1.05)`,
      }
    },
    veilStyle() {
      if (!this.selectedImage) {
        return {
          backdropFilter: 'blur(6px)',
          background: 'rgba(0, 0, 0, 0.3)',
        }
      }
      const brightnessFactor = 0.3 - (this.bgBrightness - 50) * 0.003
      return {
        backdropFilter: `blur(${this.bgBlur}px)`,
        background: `rgba(0, 0, 0, ${Math.max(0.08, brightnessFactor)})`,
      }
    },
    veilStyleWithParallax() {
      const base = this.veilStyle
      if (!this.selectedImage || !this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) return base
      return {
        ...base,
        transform: `translate(${this.parallaxX * 0.5}px, ${this.parallaxY * 0.5}px)`,
      }
    },
    focusCenterParallaxStyle() {
      if (!this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) return {}
      return {
        transform: `translate(${this.parallaxX * 0.3}px, ${this.parallaxY * 0.3}px)`,
      }
    },
    statsDuration() {
      if (!this.sessionStats) return ''
      const mins = Math.floor(this.sessionStats.totalSeconds / 60)
      const secs = this.sessionStats.totalSeconds % 60
      if (mins > 0) return `${mins}m ${secs}s`
      return `${secs}s`
    },
    statsDate() {
      if (!this.sessionStats) return ''
      const d = new Date(this.sessionStats.date)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    sceneLabel() {
      if (this.backgroundType === 'solid') return this.currentScene?.name || ''
      if (this.selectedSceneName) return this.selectedSceneName
      if (this.selectedImage) return 'Custom'
      return this.currentScene?.name || ''
    },
  },
  watch: {
    selectedDuration(val) {
      this.totalSeconds = val * 60
      this.remainingSeconds = val * 60
    },
    motivationalText(val) {
      this.displayedText = val
    },
  },
  methods: {
    onMouseMove(e) {
      if (!this.parallaxEnabled) {
        this.parallaxX = 0
        this.parallaxY = 0
        return
      }
      const w = window.innerWidth
      const h = window.innerHeight
      const cx = w / 2
      const cy = h / 2
      const strength = 30
      this.parallaxX = ((e.clientX - cx) / cx) * strength
      this.parallaxY = ((e.clientY - cy) / cy) * strength
    },
    pickPreset(d) {
      this.isCustom = false
      this.selectedDuration = d.value
    },
    openCustom() {
      this.isCustom = true
      this.$nextTick(() => {
        const inp = this.$refs.customInput
        if (inp) { inp.focus(); inp.select() }
      })
    },
    commitCustom() {
      let val = Math.max(1, Math.min(999, Math.round(this.customMinutes) || 30))
      this.customMinutes = val
      this.selectedDuration = val
    },
    startTimer() {
      if (this.isCompleted) {
        this.resetTimer()
      }
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = this.totalSeconds
      }
      this.ritualActive = true
      this.ritualPhase = 0
      this.ritualText = 'Breathe in...'
      if (!this.isFullscreen) {
        try { document.documentElement.requestFullscreen?.() } catch (_) { /* not in browser */ }
      }
      this.ritualTimer1 = setTimeout(() => {
        this.ritualPhase = 1
        this.ritualText = 'Breathe out...'
      }, 1500)
      this.ritualTimer2 = setTimeout(() => {
        this.ritualActive = false
        this.ritualPhase = 0
        // Use intention as the focus text during the session
        if (this.intention && this.intention.trim()) {
          this.displayedText = this.intention.trim()
        }
        this.isRunning = true
        this.isCompleted = false
        this.isStarting = true
        setTimeout(() => { this.isStarting = false }, 600)
        this.timerInterval = setInterval(() => {
          if (this.remainingSeconds > 0) {
            this.remainingSeconds--
          } else {
            this.completeTimer()
          }
        }, 1000)
      }, 3000)
    },
    pauseTimer() {
      this.isRunning = false
      clearInterval(this.timerInterval)
    },
    resetTimer() {
      this.isRunning = false
      this.isCompleted = false
      this.sessionStats = null
      this.copied = false
      this.remainingSeconds = this.totalSeconds
      // Restore the displayed text
      this.displayedText = this.motivationalText
      clearInterval(this.timerInterval)
    },
    completeTimer() {
      this.isRunning = false
      this.isCompleted = true
      // Capture session stats
      this.sessionStats = {
        totalSeconds: this.totalSeconds,
        intention: this.intention?.trim() || '',
        scene: this.sceneLabel || 'Focus',
        date: Date.now(),
      }
      saveSession(this.sessionStats)
      this.intention = ''
      clearInterval(this.timerInterval)
    },
    newSession() {
      this.resetTimer()
    },
    copyStats() {
      if (!this.sessionStats) return
      const d = new Date(this.sessionStats.date)
      const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      const mins = Math.floor(this.sessionStats.totalSeconds / 60)
      const secs = this.sessionStats.totalSeconds % 60
      const durationStr = mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`
      let text = `${$t('focusedOn', { date: dateStr })}\n${$t('duration')}: ${durationStr}`
      if (this.sessionStats.scene) text += `\n${$t('scene')}: ${this.sessionStats.scene}`
      if (this.sessionStats.intention) text += `\n${$t('intention')}: ${this.sessionStats.intention}`
      text += '\n\n— Deep Still'
      navigator.clipboard.writeText(text).then(() => {
        this.copied = true
        setTimeout(() => { this.copied = false }, 2000)
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        this.copied = true
        setTimeout(() => { this.copied = false }, 2000)
      })
    },
    exitFocus() {
      this.resetTimer()
      this.$router.push('/scenes')
    },
    setBackground(type) {
      this.backgroundType = type
      if (type === 'scene' && !this.selectedImage && samples.length > 0) {
        const pick = samples[Math.floor(Math.random() * samples.length)]
        this.selectedImage = pick.style
        this.selectedImageAuthor = pick.author || ''
        this.selectedSceneName = pick.label
        this.queuePhotoLoad()
      }
      if (type === 'solid') {
        this.selectedImage = ''
        this.selectedImageAuthor = ''
        this.selectedSceneName = ''
        this.photoLoaded = false
      }
    },
    selectPhoto() {
      this.isImagePickerOpen = true
    },
    handleImagePicked(imagePayload) {
      if (imagePayload && typeof imagePayload === 'object' && imagePayload.style) {
        this.selectedImage = imagePayload.style
        this.selectedImageAuthor = imagePayload.author || ''
        this.selectedSceneName = imagePayload.label || ''
      } else {
        this.selectedImage = imagePayload
        this.selectedImageAuthor = ''
        this.selectedSceneName = ''
      }
      this.isImagePickerOpen = false
      this.queuePhotoLoad()
    },
    closeImagePicker() {
      this.isImagePickerOpen = false
    },
    queuePhotoLoad() {
      this.photoLoaded = false
      clearTimeout(this.photoLoadTimer)
      // Cancel any in-flight preload
      if (this.preloadImage) {
        this.preloadImage.onload = null
        this.preloadImage.onerror = null
        this.preloadImage = null
      }
      const url = this.extractImageUrl(this.selectedImage)
      if (!url) {
        this.photoLoaded = true
        return
      }
      // Preload off-screen so the browser decodes the full image before painting
      const img = new Image()
      this.preloadImage = img
      img.onload = () => {
        if (img !== this.preloadImage) return // stale
        requestAnimationFrame(() => {
          this.photoLoaded = true
        })
      }
      img.onerror = () => {
        if (img !== this.preloadImage) return // stale
        this.photoLoaded = true
      }
      img.src = url
    },
    extractImageUrl(style) {
      if (!style) return ''
      if (typeof style === 'string') {
        const m = style.match(/url\(['"]?([^'")]+)['"]?\)/)
        return m ? m[1] : ''
      }
      if (typeof style === 'object' && style.backgroundImage) {
        const m = style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)
        return m ? m[1] : ''
      }
      return ''
    },
  },
  created() {
    this.motivationalText = defaultMotivationalTexts[
      Math.floor(Math.random() * defaultMotivationalTexts.length)
    ]
    this.displayedText = this.motivationalText
    this._onFsChange = () => {
      this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement)
    }
    document.addEventListener('fullscreenchange', this._onFsChange)
    document.addEventListener('webkitfullscreenchange', this._onFsChange)
    this._onMouseMove = this.onMouseMove.bind(this)
    document.addEventListener('mousemove', this._onMouseMove, { passive: true })
  },
  beforeUnmount() {
    clearInterval(this.timerInterval)
    clearTimeout(this.photoLoadTimer)
    clearTimeout(this.ritualTimer1)
    clearTimeout(this.ritualTimer2)
    document.removeEventListener('fullscreenchange', this._onFsChange)
    document.removeEventListener('mousemove', this._onMouseMove)
    if (this.preloadImage) {
      this.preloadImage.onload = null
      this.preloadImage.onerror = null
    }
    document.removeEventListener('fullscreenchange', this._onFsChange)
  },
}
</script>

<style scoped>
.focus-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.background-choose {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  z-index: 3;
  pointer-events: auto;
  width: 100%;
  max-width: 900px;
  padding: 0 16px;
}

.bkg-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 6px;
  gap: 8px;
}

.bkg-choice {
  padding: 6px 14px;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 300;
  cursor: pointer;
  user-select: none;
  transition: background 0.18s var(--transition-smooth), transform 0.12s ease;
}

.bkg-choice[aria-selected="true"] {
  background: rgba(255, 255, 255, 0.08);
}

.bkg-choice:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.bkg-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
}


.focus-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  contain: paint layout;
}

.focus-bg-gradient {
  position: absolute;
  inset: 0;
}

.focus-bg-photo {
  position: absolute;
  inset: -5%;
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.15s ease-out;
  will-change: transform, opacity;
  contain: paint layout style;
  background-size: cover;
  background-position: center;
}

.focus-bg-photo.photo-loaded {
  opacity: 1;
}

.focus-bg-veil {
  position: absolute;
  inset: -5%;
  transition: backdrop-filter 0.4s ease, background 0.4s ease, transform 0.15s ease-out;
}

.scene-author {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 5;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.3px;
  background: transparent;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.focus-layout {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 32px;
}

.timer-card.layout-scene {
  position: absolute;
  left: 24px;
  top: calc(100% - 24px);
  right: auto;
  z-index: 4;
  transform: translate(0, -100%) scale(0.8);
  transform-origin: left bottom;
  transition: transform 360ms var(--transition-smooth), left 360ms var(--transition-smooth), top 360ms var(--transition-smooth);
}

.timer-card.running {
  transform: translate(-50%, -50%) scale(0.95);
}

.timer-card.layout-scene.running {
  transform: translate(0, -100%) scale(0.72);
}

.exit-btn {
  align-self: flex-end;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--transition-smooth);
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.focus-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease-out;
  will-change: transform;
}

.timer-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  transform-origin: center center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 48px 64px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(32px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  min-width: 440px;
  transition: transform 360ms var(--transition-smooth), opacity 360ms var(--transition-smooth), left 360ms var(--transition-smooth), top 360ms var(--transition-smooth);
}

.bottom-actions {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 3;
}

.bottom-actions-left {
  display: flex;
  gap: 8px;
}

.bottom-action-btn {
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
  transition: all 0.3s var(--transition-smooth);
}

.bottom-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.parallax-toggle.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.parallax-toggle.active svg {
  stroke: #fff;
}

.duration-collapse {
  width: 100%;
  max-height: 120px;
  overflow: hidden;
  transition: max-height 400ms var(--transition-smooth), opacity 400ms var(--transition-smooth);
  opacity: 1;
}

.duration-collapse.collapsed {
  max-height: 0;
  opacity: 0;
}

.duration-collapse-inner {
  overflow: hidden;
}

/* --- Intention input --- */

.intention-collapse {
  width: 100%;
  max-height: 60px;
  overflow: hidden;
  transition: max-height 400ms var(--transition-smooth), opacity 400ms var(--transition-smooth);
  opacity: 1;
}

.intention-collapse.collapsed {
  max-height: 0;
  opacity: 0;
}

.intention-collapse-inner {
  overflow: hidden;
}

.intention-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.intention-input {
  width: 100%;
  max-width: 320px;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 100px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 300;
  font-family: inherit;
  text-align: center;
  outline: none;
  transition: background 0.25s ease, color 0.25s ease;
}

.intention-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  font-weight: 300;
  letter-spacing: 0.2px;
}

.intention-input:focus {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.85);
}

.intention-input:focus::placeholder {
  color: rgba(255, 255, 255, 0.15);
}

.duration-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.duration-label {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
}

.duration-options {
  display: flex;
  gap: 8px;
}

.duration-chip {
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 300;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth);
}

.duration-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.duration-chip.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.custom-chip {
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  cursor: pointer;
}

.custom-chip.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.custom-trigger {
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 300;
  font-family: inherit;
  cursor: pointer;
  border-radius: 100px;
  width: 100%;
  transition: color 0.3s var(--transition-smooth);
  line-height: 1;
}

.custom-trigger:hover {
  color: rgba(255, 255, 255, 0.8);
}

.custom-chip.active .custom-trigger {
  color: #fff;
}

.custom-input {
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 300;
  font-family: inherit;
  text-align: center;
  outline: none;
  line-height: 1;
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Hide number input spinners */
.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.custom-input[type='number'] {
  -moz-appearance: textfield;
}

.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.timer-digits {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.timer-number {
  font-size: 100px;
  font-weight: 200;
  letter-spacing: 4px;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  transition: all 0.3s var(--transition-smooth);
}

.timer-colon {
  font-size: 80px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1;
  margin: 0 4px;
}

.timer-completed {
  animation: completedPulse 2s ease-in-out infinite;
}

@keyframes completedPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.completed-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.completed-icon {
  font-size: 40px;
  color: rgba(255, 255, 255, 0.6);
}

.completed-text {
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 2px;
}

.timer-progress {
  width: 280px;
}

.progress-track {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transition: width 1s linear;
}

.motivational-text {
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  text-align: center;
  min-height: 24px;
}

.timer-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.control-btn.primary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 14px 36px;
}

.control-btn.primary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.control-btn.ghost {
  border: none;
  background: transparent;
  padding: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.control-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}

/* --- Transition animations --- */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s var(--transition-smooth);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s var(--transition-smooth);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.timer-entering .timer-number {
  animation: timerEntrance 0.5s var(--transition-smooth);
}

@keyframes timerEntrance {
  0% {
    transform: scale(0.92);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fullscreen-hint {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  z-index: 10;
  white-space: nowrap;
  pointer-events: none;
}

.fullscreen-hint kbd {
  display: inline-block;
  padding: 1px 6px;
  margin: 0 2px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: inherit;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* --- Adjust panel popup --- */

.adjust-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.adjust-panel {
  width: 320px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 16, 0.92);
  backdrop-filter: blur(40px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.adjust-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.adjust-panel-title {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: rgba(255, 255, 255, 0.8);
}

.adjust-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
}

.adjust-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}

.adjust-panel-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.adjust-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.adjust-row-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 300;
}

.adjust-row-label svg {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.25);
}

.adjust-row-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.adjust-row-control .glass-slider {
  width: 120px;
}

.adjust-value {
  font-size: 12px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.35);
  min-width: 32px;
  text-align: right;
}

/* --- Glass range slider --- */

.glass-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.glass-slider:hover {
  background: rgba(255, 255, 255, 0.12);
}

.glass-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.glass-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: rgba(255, 255, 255, 0.85);
}

.glass-slider::-webkit-slider-thumb:active {
  transform: scale(1.3);
  background: #fff;
}

.glass-slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
}

.glass-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
}

/* --- Session Start Ritual --- */

.ritual-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
}

.ritual-breath-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: transform 1.5s var(--transition-smooth),
              border-color 1.5s var(--transition-smooth);
}

.ritual-breath-ring.inhale {
  transform: scale(1.8);
  border-color: rgba(255, 255, 255, 0.30);
}

.ritual-breath-ring.exhale {
  transform: scale(1);
  border-color: rgba(255, 255, 255, 0.10);
}

.ritual-ring-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: transform 1.5s var(--transition-smooth),
              background 1.5s var(--transition-smooth);
}

.ritual-breath-ring.inhale .ritual-ring-inner {
  transform: scale(0.5);
  background: rgba(255, 255, 255, 0.50);
}

.ritual-breath-ring.exhale .ritual-ring-inner {
  transform: scale(1);
  background: rgba(255, 255, 255, 0.15);
}

.ritual-text {
  font-size: 18px;
  font-weight: 200;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  transition: opacity 0.4s ease;
}

.ritual-fade-enter-active {
  transition: opacity 0.6s ease;
}
.ritual-fade-leave-active {
  transition: opacity 0.4s ease;
}
.ritual-fade-enter-from,
.ritual-fade-leave-to {
  opacity: 0;
}

/* --- Session Stats Card --- */

.stats-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
}

.stats-card {
  width: 320px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 16, 0.94);
  backdrop-filter: blur(40px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.stats-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.4);
}

.stats-title {
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
}

.stats-metrics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.stats-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stats-metric-label {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

.stats-metric-value {
  font-size: 22px;
  font-weight: 200;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
}

.stats-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.08);
}

.stats-intention {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stats-intention-label {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.2);
}

.stats-intention-text {
  font-size: 15px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.stats-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.stats-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 24px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth);
}

.stats-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.stats-btn.primary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.stats-btn.primary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}

.stats-btn.ghost {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  padding: 8px;
}

.stats-btn.ghost:hover {
  color: rgba(255, 255, 255, 0.65);
  background: transparent;
}

.stats-actions-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.stats-actions-row .stats-btn {
  flex: 1;
}

@media (max-width: 600px) {
  .timer-card {
    padding: 32px 24px;
    min-width: unset;
    width: 100%;
    gap: 24px;
  }
  .timer-number {
    font-size: 60px;
  }
  .timer-colon {
    font-size: 48px;
  }
  .focus-layout {
    padding: 16px;
    padding-top: calc(16px + var(--safe-top));
  }

  .bottom-actions {
    right: 16px;
    bottom: calc(16px + var(--safe-bottom));
    gap: 8px;
  }
  .bottom-actions .bottom-action-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
  }
  .bottom-actions .bottom-action-btn span {
    display: none;
  }

  .timer-card.layout-scene {
    left: 12px;
    right: 12px;
    top: auto;
    bottom: calc(64px + var(--safe-bottom));
    width: auto;
    max-width: 480px;
    margin: 0 auto;
    transform: translate(0, 0) scale(1);
  }

  /* Running: collapse the big card into a compact horizontal pill */
  .timer-card.running {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px 22px;
    left: 50%;
    top: 50%;
    width: auto;
    max-width: calc(100vw - 32px);
    border-radius: 999px;
    transform: translate(-50%, -50%);
  }
  .timer-card.layout-scene.running {
    top: auto;
    bottom: calc(64px + var(--safe-bottom));
    left: 50%;
    right: auto;
    transform: translate(-50%, 0);
  }
  .timer-card.running .timer-display {
    flex-direction: row;
    align-items: center;
    gap: 14px;
    width: auto;
  }
  .timer-card.running .duration-collapse,
  .timer-card.running .intention-collapse {
    display: none;
  }
  .timer-card.running .timer-number {
    font-size: 40px;
    transition: none;
  }
  .timer-card.running .timer-colon {
    font-size: 32px;
  }
  .timer-card.running .timer-progress {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 8px;
    width: auto;
  }
  .timer-card.running .motivational-text {
    display: none;
  }
  .timer-card.running .timer-controls {
    gap: 4px;
  }
  .timer-card.running .control-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  .timer-card.running .control-btn.ghost {
    padding: 10px;
  }

  .scene-author {
    left: 16px;
    top: 72px;
    bottom: auto;
  }

  .stats-card {
    width: calc(100% - 32px);
    max-width: 320px;
    padding: 24px 20px 20px;
  }
  .stats-metrics {
    gap: 12px;
  }
  .adjust-panel {
    width: calc(100% - 32px);
    max-width: 320px;
  }
  .adjust-row-control .glass-slider {
    width: 90px;
  }

  .fullscreen-hint {
    bottom: calc(24px + var(--safe-bottom));
  }
}

@media (max-width: 400px) {
  .timer-number {
    font-size: 44px;
  }
  .timer-colon {
    font-size: 36px;
  }
  .duration-chip,
  .custom-trigger {
    padding-left: 12px;
    padding-right: 12px;
  }
  .timer-progress {
    width: 220px;
  }
}

@media (max-height: 500px) {
  .timer-card {
    gap: 16px;
    padding: 20px 24px;
    max-height: calc(100dvh - 120px);
    overflow-y: auto;
  }
  .timer-number {
    font-size: 44px;
  }
  .timer-colon {
    font-size: 36px;
  }
  .timer-progress {
    width: 200px;
  }
}
</style>
