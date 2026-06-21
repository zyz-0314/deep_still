<template>
  <div class="scene-select-root">
    <div class="scene-select">
      <div class="scene-bg">
        <div
          class="scene-bg-layer scene-bg-prev"
          :style="{ background: prevScene.gradient, transform: bgParallax }"
        ></div>
        <div
          class="scene-bg-layer scene-bg-current"
          :class="{ 'bg-visible': bgReady }"
          :style="{ background: currentScene.gradient, transform: bgParallax }"
        >
          <div class="bg-veil" :class="{ 'veil-shift': bgTransitioning }" :style="{ transform: veilParallax }"></div>
        </div>
      </div>

      <div class="scene-layout">
        <div class="back-wrapper" :style="{ transform: backParallax }">
          <button class="back-btn" @click="goHome">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <div class="scene-main">
          <div class="scene-preview-wrapper" :style="{ transform: previewParallax }">
            <div class="scene-preview">
              <div
                class="preview-glass"
                :style="{ background: currentScene.gradient }"
                :key="selectedScene"
              >
                <div class="preview-content">
                  <span class="preview-icon">{{ currentScene.icon }}</span>
                  <h2 class="preview-name">{{ currentScene.name }}</h2>
                  <p class="preview-subtitle">{{ currentScene.subtitle }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="scene-panel-wrapper" :style="{ transform: panelParallax }">
            <div class="scene-panel">
              <div class="panel-header">
                <h3 class="panel-title">Choose your scene</h3>
                <p class="panel-desc">Select an environment for your focus session</p>
              </div>

              <div class="scene-grid">
                <button
                  v-for="scene in scenes"
                  :key="scene.id"
                  class="scene-card"
                  :class="{ active: selectedScene === scene.id }"
                  @click="selectScene(scene)"
                >
                  <div class="scene-thumb" :style="{ background: scene.gradient }">
                    <span class="scene-thumb-icon">{{ scene.icon }}</span>
                    <div v-if="selectedScene === scene.id" class="selected-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div class="scene-meta">
                    <span class="scene-name">{{ scene.name }}</span>
                    <span class="scene-sub">{{ scene.subtitle }}</span>
                  </div>
                </button>
              </div>

              <div class="panel-footer">
                <button class="continue-btn" @click="goToFocus">
                  <span>Continue with {{ currentScene.name }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { scenes } from '@/data/scenes'

export default {
  name: 'SceneSelection',
  data() {
    return {
      scenes,
      selectedScene: 'lake',
      prevSceneId: 'lake',
      bgReady: true,
      bgTransitioning: false,
      parallaxX: 0,
      parallaxY: 0,
      parallaxEnabled: true,
    }
  },
  computed: {
    currentScene() {
      return this.scenes.find(s => s.id === this.selectedScene) || this.scenes[0]
    },
    prevScene() {
      return this.scenes.find(s => s.id === this.prevSceneId) || this.scenes[0]
    },
    backParallax() {
      return this.parallaxEnabled
        ? `translate(${this.parallaxX * 0.2}px, ${this.parallaxY * 0.2}px)`
        : 'none'
    },
    bgParallax() {
      return this.parallaxEnabled
        ? `translate(${this.parallaxX * 0.1}px, ${this.parallaxY * 0.1}px)`
        : 'none'
    },
    veilParallax() {
      return this.parallaxEnabled
        ? `translate(${this.parallaxX * 0.05}px, ${this.parallaxY * 0.05}px)`
        : 'none'
    },
    previewParallax() {
      return this.parallaxEnabled
        ? `translate(${this.parallaxX * 0.6}px, ${this.parallaxY * 0.6}px)`
        : 'none'
    },
    panelParallax() {
      return this.parallaxEnabled
        ? `translate(${this.parallaxX * -0.3}px, ${this.parallaxY * -0.3}px)`
        : 'none'
    },
  },
  methods: {
    selectScene(scene) {
      if (scene.id === this.selectedScene) return
      this.prevSceneId = this.selectedScene
      this.selectedScene = scene.id
      this.bgReady = false
      this.bgTransitioning = true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.bgReady = true
          setTimeout(() => {
            this.bgTransitioning = false
            this.prevSceneId = scene.id
          }, 800)
        })
      })
    },
    goToFocus() {
      this.$router.push({ name: 'FocusPage', query: { scene: this.selectedScene } })
    },
    goHome() {
      this.$router.push({ name: 'Landing' })
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
    this._onMouseMove = this.onMouseMove.bind(this)
    document.addEventListener('mousemove', this._onMouseMove, { passive: true })
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this._onMouseMove)
  },
}
</script>

<style scoped>
.scene-select-root {
  position: fixed;
  inset: 0;
}

.scene-select {
  position: fixed;
  inset: 0;
  display: flex;
  overflow: hidden;
  background: #08080c;
}

.scene-bg {
  position: absolute;
  inset: 0;
}

.scene-bg-layer {
  position: absolute;
  inset: 0;
  transition: opacity 0.8s var(--transition-smooth), transform 0.15s ease-out;
}

.scene-bg-prev {
  opacity: 1;
}

.scene-bg-current {
  opacity: 0;
}

.scene-bg-current.bg-visible {
  opacity: 1;
}

.bg-veil {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  transition: backdrop-filter 0.8s var(--transition-smooth), transform 0.15s ease-out;
}

.bg-veil.veil-shift {
  backdrop-filter: blur(6px);
}

.scene-layout {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 32px 40px 32px;
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
}

.back-wrapper {
  align-self: flex-start;
  transition: transform 0.15s ease-out;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.scene-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  padding: 20px 0;
}

.scene-preview {
  flex-shrink: 0;
  animation: fadeSlideIn 0.8s var(--transition-smooth) 0.2s both;
}

.scene-preview-wrapper,
.scene-panel-wrapper {
  transition: transform 0.15s ease-out;
}

.scene-preview-wrapper {
  flex-shrink: 0;
}

.scene-panel-wrapper {
  width: 380px;
}

.preview-glass {
  width: 340px;
  height: 480px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  transition: all 0.8s var(--transition-smooth);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.preview-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.preview-icon {
  font-size: 64px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.preview-name {
  font-size: 28px;
  font-weight: 200;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.preview-subtitle {
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.scene-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeSlideIn 0.8s var(--transition-smooth) 0.4s both;
}

.panel-header {
  text-align: left;
}

.panel-title {
  font-size: 32px;
  font-weight: 200;
  letter-spacing: -0.5px;
  color: #fff;
  margin-bottom: 8px;
}

.panel-desc {
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

.scene-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scene-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.4s var(--transition-smooth);
}

.scene-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.scene-card.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.scene-thumb {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.scene-thumb-icon {
  font-size: 22px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.selected-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scene-name {
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.scene-sub {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

.panel-footer {
  padding-top: 8px;
}

.continue-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 28px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  font-family: inherit;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.5s var(--transition-smooth);
}

.continue-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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

@media (max-width: 900px) {
  .scene-main {
    flex-direction: column;
    gap: 40px;
  }
  .scene-preview-wrapper {
    display: none;
  }
  .scene-panel-wrapper {
    width: 100%;
  }
  .scene-panel {
    width: 100%;
    max-width: 400px;
  }
  .scene-layout {
    padding: 20px;
  }
}
</style>
