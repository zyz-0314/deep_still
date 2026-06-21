<template>
  <transition name="fade">
    <div v-if="show" class="picker-modal-root">
      <div class="picker-overlay" role="dialog" aria-modal="true">
        <div class="picker-dialog">
          <div class="picker-header">
            <h2>Select a scene image</h2>
            <button class="close-btn" type="button" @click="$emit('close')" aria-label="Close modal">×</button>
          </div>

          <div class="picker-body">
            <p class="picker-description">Choose a built-in sample or upload your own photo.</p>

            <div
              class="sample-strip"
              :class="{ 'is-reordering': isReordering }"
              ref="strip"
              @wheel.prevent="onStripWheel"
            >
              <button
                v-for="(sample, index) in samples"
                :key="sample.id"
                type="button"
                class="sample-item"
                :class="{
                  'drag-over': dragOverIndex === index && dragIndex !== index,
                  'is-custom': sample.isCustom,
                }"
                :style="sample.style"
                :draggable="true"
                @click="selectSample($event, sample)"
                @dragstart="onDragStart($event, index)"
                @dragend="onDragEnd"
                @dragover="onDragOver($event, index)"
                @dragleave="onDragLeave"
                @drop.prevent="onDrop($event, index)"
                @contextmenu="onContextMenu($event, sample)"
              >
                <div class="sample-meta">
                  <span class="sample-label">{{ sample.label }}</span>
                  <span v-if="sample.author" class="sample-author">{{ sample.author }}</span>
                  <span v-if="sample.isCustom" class="sample-custom-badge">Custom</span>
                </div>
              </button>
            </div>

            <label class="upload-label">
              Upload image
              <input type="file" accept="image/*" @change="handleFileChange" />
            </label>
          </div>
        </div>
      </div>

      <div
        v-if="contextMenu"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @mousedown.stop
      >
        <button class="context-menu-btn" type="button" @mousedown.stop @click="renameCustom(contextMenu.sample)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Rename</span>
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-btn danger" type="button" @mousedown.stop @click="deleteCustom(contextMenu.sample)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>Delete</span>
        </button>
      </div>

    </div>
  </transition>

  <div v-if="renameTarget" class="rename-overlay" @click.self="cancelRename">
    <div class="rename-panel">
      <div class="rename-panel-header">
        <span class="rename-panel-title">Rename photo</span>
        <button class="rename-close" type="button" @click="cancelRename">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="rename-panel-body">
        <input
          ref="renameInput"
          v-model="renameText"
          class="rename-input"
          type="text"
          maxlength="40"
          placeholder="Photo name"
          @keydown.enter="commitRename"
          @keydown.escape="cancelRename"
        />
        <div class="rename-actions">
          <button class="rename-btn secondary" @click="cancelRename">Cancel</button>
          <button class="rename-btn primary" @click="commitRename">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { samples as originalSamples } from '@/data/samples'
import { getSceneOrder, setSceneOrder, getCustomUploads, saveCustomUpload, deleteCustomUpload, renameCustomUpload } from '@/data/storage'

export default {
  name: 'ImagePickerModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      samples: [],
      dragIndex: null,
      dragOverIndex: null,
      isReordering: false,
      reorderTimer: null,
      contextMenu: null,
      renameTarget: null,
      renameText: '',
    }
  },
  watch: {
    show(val) {
      if (val) this.loadSamples()
    },
  },
  methods: {
    loadSamples() {
      const savedOrder = getSceneOrder()
      // Build a map from ALL items (originals + customs) keyed by id
      const allMap = {}
      originalSamples.forEach(s => { allMap[s.id] = s })

      const customs = getCustomUploads()
      customs.forEach(c => {
        allMap[c.id] = {
          id: c.id,
          label: c.label,
          style: {
            backgroundImage: `url('${c.dataUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          isCustom: true,
        }
      })

      if (savedOrder) {
        // Apply the persisted order to everything possible
        const ordered = savedOrder.map(id => allMap[id]).filter(Boolean)
        // Append any items not yet in the saved order
        Object.keys(allMap).forEach(id => {
          if (!ordered.find(x => x.id === id)) ordered.push(allMap[id])
        })
        this.samples = ordered
      } else {
        // Default: originals first, then customs
        this.samples = [...originalSamples, ...customs.map(c => ({
          id: c.id,
          label: c.label,
          style: {
            backgroundImage: `url('${c.dataUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          isCustom: true,
        }))]
      }
    },
    selectSample(event, sample) {
      if (event && event.button !== undefined && event.button !== 0) return
      this.$emit('select', { style: sample.style, author: sample.author || null, label: sample.label })
    },
    handleFileChange(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target.result
        if (typeof result === 'string') {
          const saved = saveCustomUpload(result)
          const entry = {
            id: saved.id,
            label: saved.label,
            style: {
              backgroundImage: `url('${saved.dataUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            },
            isCustom: true,
          }
          const firstCustomIdx = this.samples.findIndex(s => s.isCustom)
          if (firstCustomIdx === -1) {
            this.samples.push(entry)
          } else {
            this.samples.splice(firstCustomIdx, 0, entry)
          }
          setSceneOrder(this.samples.map(s => s.id))
          this.$nextTick(() => {
            const strip = this.$refs.strip
            if (strip) strip.scrollLeft = strip.scrollWidth
          })
        }
      }
      reader.readAsDataURL(file)
    },
    onStripWheel(event) {
      const strip = this.$refs.strip
      if (!strip) return
      const delta = event.deltaY
      if (delta === 0) return
      const maxScroll = strip.scrollWidth - strip.clientWidth
      strip.scrollLeft = Math.max(0, Math.min(maxScroll, strip.scrollLeft + delta))
    },

    // ─── Drag-to-reorder ───

    onDragStart(e, index) {
      this.dragIndex = index
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', index.toString())
      this.disableSnap()
    },
    onDragEnd(e) {
      e.target.style.opacity = ''
      this.dragIndex = null
      this.dragOverIndex = null
      this.restoreSnap()
    },
    onDragOver(e, index) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      this.dragOverIndex = index
    },
    onDragLeave() {
      this.dragOverIndex = null
    },
    disableSnap() {
      const strip = this.$refs.strip
      if (!strip) return
      strip.style.scrollSnapType = 'none'
      strip.style.maskImage = 'none'
      strip.style.webkitMaskImage = 'none'
    },
    restoreSnap() {
      clearTimeout(this.reorderTimer)
      this.reorderTimer = setTimeout(() => {
        const strip = this.$refs.strip
        if (!strip) return
        strip.style.scrollSnapType = ''
        strip.style.maskImage = ''
        strip.style.webkitMaskImage = ''
      }, 500)
    },
    onDrop(e, index) {
      e.preventDefault()
      const from = this.dragIndex
      if (from === null || from === index) return

      const strip = this.$refs.strip
      const children = strip?.children
      const oldRects = []
      if (children) {
        for (let i = 0; i < children.length; i++) {
          const r = children[i].getBoundingClientRect()
          oldRects.push({ left: r.left, top: r.top })
        }
      }

      const items = [...this.samples]
      const [moved] = items.splice(from, 1)
      items.splice(index, 0, moved)
      this.samples = items

      this.dragIndex = null
      this.dragOverIndex = null
      setSceneOrder(items.map(s => s.id))

      this.$nextTick(() => {
        if (!strip) return
        for (let i = 0; i < strip.children.length; i++) {
          const child = strip.children[i]
          const oldRect = oldRects[i]
          if (!oldRect) continue
          const newRect = child.getBoundingClientRect()
          const dx = oldRect.left - newRect.left
          if (dx !== 0 || (oldRect.top - newRect.top) !== 0) {
            child.style.transition = 'none'
            child.style.transform = `translateX(${dx}px)`
            child.getBoundingClientRect()
            child.style.transition = ''
            child.style.transform = ''
          }
        }
      })
    },

    // ─── Right-click context menu ───

    onContextMenu(e, sample) {
      if (!sample || !sample.isCustom) return
      e.preventDefault()
      e.stopPropagation()
      this.contextMenu = { sample, x: e.clientX, y: e.clientY }
    },
    renameCustom(sample) {
      if (!sample || !sample.isCustom) return
      this.contextMenu = null
      this.renameTarget = sample
      this.renameText = sample.label || ''
      this.$nextTick(() => {
        const inp = this.$refs.renameInput
        if (inp) { inp.focus(); inp.select() }
      })
    },
    commitRename() {
      if (!this.renameTarget) return
      const label = this.renameText.trim()
      if (label && label !== this.renameTarget.label) {
        renameCustomUpload(this.renameTarget.id, label)
        this.loadSamples()
      }
      this.renameTarget = null
      this.renameText = ''
    },
    cancelRename() {
      this.renameTarget = null
      this.renameText = ''
    },
    deleteCustom(sample) {
      if (!sample || !sample.isCustom) return
      deleteCustomUpload(sample.id)
      this.contextMenu = null
      this.loadSamples()
      setSceneOrder(this.samples.map(s => s.id))
    },
    closeContextMenu() {
      this.contextMenu = null
    },
  },
  mounted() {
    this.loadSamples()
    document.addEventListener('mousedown', this.closeContextMenu)
  },
  beforeUnmount() {
    clearTimeout(this.reorderTimer)
    document.removeEventListener('mousedown', this.closeContextMenu)
  },
}
</script>

<style scoped>
.picker-modal-root {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.picker-dialog {
  width: min(720px, 100%);
  border-radius: 28px;
  background: rgba(16, 16, 18, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 36px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03);
  overflow: hidden;
  backdrop-filter: blur(40px);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 0;
}

.picker-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -0.2px;
  color: rgba(255, 255, 255, 0.9);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}

.picker-body {
  padding: 18px 28px 28px;
}

.picker-description {
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  font-weight: 300;
}

.sample-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding: 4px 0 12px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  user-select: none;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 3%,
    #000 93%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 3%,
    #000 93%,
    transparent 100%
  );
}

.sample-strip::-webkit-scrollbar {
  height: 4px;
}

.sample-strip::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  margin: 0 12px;
}

.sample-strip::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  transition: background 0.3s ease;
}

.sample-strip::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.22);
}

.sample-strip {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) rgba(255, 255, 255, 0.05);
}

.sample-item {
  scroll-snap-align: start;
  flex: 0 0 200px;
  position: relative;
  min-height: 130px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-weight: 400;
  font-size: 13px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 14px;
  text-align: center;
  cursor: grab;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
  outline: none;
  will-change: transform;
}

.sample-item:active {
  cursor: grabbing;
}

.sample-item.drag-over {
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
  transform: scale(1.03);
}

.sample-item:focus-visible {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
}

.sample-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%);
  pointer-events: none;
}

.sample-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sample-label,
.sample-author {
  position: relative;
  z-index: 1;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

.sample-label {
  font-weight: 300;
}

.sample-author {
  font-weight: 300;
}

.sample-custom-badge {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

.sample-item.is-custom {
  border-color: rgba(255, 255, 255, 0.06);
}

.sample-item:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.sample-item:active {
  transform: translateY(-1px) scale(1.01);
}

.upload-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  padding: 0 18px;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.upload-label:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
}

.upload-label input {
  display: none;
}

/* ─── Context menu (out of dialog to avoid backdrop-filter containing block) ─── */

.context-menu {
  position: fixed;
  z-index: 60;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 16, 0.95);
  backdrop-filter: blur(24px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 4px;
  min-width: 140px;
  overflow: hidden;
}

.context-menu-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.context-menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.context-menu-btn.danger:hover {
  color: rgba(255, 80, 80, 0.9);
}

.context-menu-btn svg {
  flex-shrink: 0;
}

.context-menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: rgba(255, 255, 255, 0.06);
}

/* ─── Rename panel ─── */

.rename-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
}

.rename-panel {
  width: 300px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 16, 0.94);
  backdrop-filter: blur(40px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.rename-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 0;
}

.rename-panel-title {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: rgba(255, 255, 255, 0.8);
}

.rename-close {
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

.rename-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}

.rename-panel-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rename-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 14px;
  font-weight: 300;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.rename-input:focus {
  border-color: rgba(255, 255, 255, 0.25);
}

.rename-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.rename-actions {
  display: flex;
  gap: 8px;
}

.rename-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth, cubic-bezier(0.22, 1, 0.36, 1));
}

.rename-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.rename-btn.primary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.rename-btn.primary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s var(--transition-smooth, cubic-bezier(0.22, 1, 0.36, 1));
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
