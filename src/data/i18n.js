import { reactive } from 'vue'
import { locales } from './locales'

const SAVED_KEY = 'deep-still-locale'

export const state = reactive({
  code: localStorage.getItem(SAVED_KEY) || 'en',
})

export function setLocale(code) {
  state.code = code
  localStorage.setItem(SAVED_KEY, code)
}

export function getLocale() {
  return state.code
}

export const supported = Object.keys(locales)

/* Reactive getter — use in computed: t() { return $t } */
export function $t(key, params = {}) {
  const dict = locales[state.code] || locales.en
  let str = dict[key]
  if (str === undefined) str = locales.en[key] || key
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{{${k}}}`, v)
  }
  return str
}
