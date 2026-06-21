<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      transitionName: 'fade',
    }
  },
  watch: {
    '$route'(to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth >= fromDepth ? 'page-forward' : 'page-back'
    },
  },
}
</script>

<style>
:root {
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-blur: blur(24px);
  --radius-sm: 16px;
  --radius-md: 24px;
  --radius-lg: 32px;
  --transition-smooth: cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s var(--transition-smooth);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: opacity 0.5s var(--transition-smooth);
}
.page-forward-enter-from,
.page-back-enter-from {
  opacity: 0;
}
.page-forward-leave-to,
.page-back-leave-to {
  opacity: 0;
}
:root, html, body, #app, * {
  cursor: default !important;
}

button,
.glass-btn,
.control-btn,
.duration-chip,
.back-btn,
.scene-card,
.continue-btn,
.exit-btn,
a,
button > * {
  cursor: pointer !important;
}

:root, html, body, #app, * {
  user-select: none !important;
}

input,
textarea,
select {
  user-select: text !important;
}
</style>
