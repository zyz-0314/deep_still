<template>
  <div class="landing">
    <div class="landing-bg">
      <div class="bg-overlay" :style="bgParallaxStyle"></div>
    </div>

    <div class="landing-content" :style="contentParallaxStyle">
      <div class="hero-text">
        <div class="hero-badge">Deep Still</div>
        <h1 class="hero-title">{{ titleLine1 }}<br />{{ titleLine2 }}</h1>
        <p class="hero-desc">
          Deep focus, deep calm.<br />
          A mindful space for uninterrupted work.<br />
          Choose your scene, set your intention, and begin.
        </p>
        <button class="glass-btn" @click="$router.push('/scenes')">
          <span>Begin your session</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div class="landing-footer">
        <div class="footer-line"></div>
        <div class="footer-center">
          <span class="footer-text">Click anywhere to explore</span>
          <button class="footer-history-btn" @click.stop="$router.push('/history')">History</button>
          <span class="footer-dot">·</span>
          <button class="footer-coffee-btn" type="button" @click.stop="goToKoFi">
            Buy me a coffee
          </button>
        </div>
        <div class="footer-line"></div>
      </div>
    </div>

    <div class="ambient-glow" :style="glowParallaxStyle"></div>

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

    <transition name="fade">
      <div v-if="navigatingTo" class="exit-overlay" key="exit">
        <div class="exit-overlay-content">
          <span class="exit-overlay-icon">○</span>
          <p class="exit-overlay-text">Opening Ko-fi...</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      titleLine1: 'Find your',
      titleLine2: 'focus.',
      parallaxX: 0,
      parallaxY: 0,
      parallaxEnabled: true,
      navigatingTo: null,
      navTimer: null,
    }
  },
  computed: {
    contentParallaxStyle() {
      if (!this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) return {}
      return { transform: `translate(${this.parallaxX * 0.4}px, ${this.parallaxY * 0.4}px)` }
    },
    bgParallaxStyle() {
      if (!this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) return {}
      return { transform: `translate(${this.parallaxX * 0.15}px, ${this.parallaxY * 0.15}px)` }
    },
    glowParallaxStyle() {
      if (!this.parallaxEnabled || (!this.parallaxX && !this.parallaxY)) {
        return { transform: 'translate(-50%, -50%)' }
      }
      return {
        transform: `translate(calc(-50% + ${this.parallaxX * 0.6}px), calc(-50% + ${this.parallaxY * 0.6}px))`,
      }
    },
  },
  methods: {
    onMouseMove(e) {
      if (!this.parallaxEnabled) {
        this.parallaxX = 0
        this.parallaxY = 0
        return
      }
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      this.parallaxX = ((e.clientX - cx) / cx) * 40
      this.parallaxY = ((e.clientY - cy) / cy) * 40
    },
    goToKoFi() {
      this.navigatingTo = 'ko-fi'
      this.navTimer = setTimeout(() => {
        window.open('https://ko-fi.com/zyz0314', '_blank', 'noopener,noreferrer')
        this.navigatingTo = null
      }, 700)
    },
  },
  mounted() {
    this.landingClickHandler = (e) => {
      if (e.target.closest('.bottom-action-btn, .glass-btn, .footer-history-btn, .footer-coffee-btn')) return
      this.$router.push('/scenes')
    }
    document.addEventListener('click', this.landingClickHandler)
    this._onMouseMove = this.onMouseMove.bind(this)
    document.addEventListener('mousemove', this._onMouseMove, { passive: true })
  },
  beforeUnmount() {
    document.removeEventListener('click', this.landingClickHandler)
    document.removeEventListener('mousemove', this._onMouseMove)
    clearTimeout(this.navTimer)
  },
}
</script>

<style scoped>
.landing {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a0a0f;
}

.landing-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 80% at 70% 20%, rgba(40, 80, 120, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 30% 80%, rgba(80, 60, 40, 0.2) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20, 40, 60, 0.4) 0%, transparent 70%),
    linear-gradient(135deg, #0a0a0f 0%, #0f1419 30%, #141a22 60%, #0f1419 100%);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.015) 50%,
      transparent 100%
    );
  background-size: 200% 100%;
  animation: shimmer 15s ease-in-out infinite alternate;
}

@keyframes shimmer {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
}

.landing-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  padding: 60px 80px 40px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  margin-bottom: 24px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
}

.hero-title {
  font-size: clamp(56px, 8vw, 96px);
  font-weight: 200;
  line-height: 1.05;
  letter-spacing: -2px;
  color: #fff;
  margin-bottom: 24px;
}

.hero-desc {
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.45);
  max-width: 420px;
  margin-bottom: 48px;
}

.glass-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 36px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  color: #fff;
  font-size: 15px;
  font-weight: 400;
  font-family: inherit;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.5s var(--transition-smooth);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.glass-btn:active {
  transform: translateY(0);
}

.landing-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0.6;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
}

.footer-history-btn {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
}

.footer-history-btn:hover {
  color: rgba(255, 255, 255, 0.85);
}

.footer-dot {
  color: rgba(255, 255, 255, 0.3);
  font-size: 11px;
}

.footer-coffee-btn {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-coffee-btn:hover {
  color: #ff813f;
}

.footer-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

.footer-text {
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(60, 120, 200, 0.06) 0%, transparent 70%);
  pointer-events: none;
  animation: pulse 8s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 0.3; transform: translateY(0); }
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

/* ─── Exit overlay ─── */

.exit-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
}

.exit-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.exit-overlay-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.3);
}

.exit-overlay-text {
  font-size: 16px;
  font-weight: 200;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .landing-content {
    padding: 40px 32px 32px;
  }
  .hero-title {
    font-size: 48px;
  }
  .hero-desc {
    font-size: 14px;
  }
}
</style>
