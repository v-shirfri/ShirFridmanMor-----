export function detectDir(text) {
  if (!text) return 'ltr'
  const sample = text.slice(0, 120).replace(/\s/g, '')
  const rtlChars = (sample.match(/[\u0590-\u05FF\u0600-\u06FF]/g) || []).length
  return rtlChars / Math.max(sample.length, 1) > 0.2 ? 'rtl' : 'ltr'
}

export const THEMES = ['classic', 'dark', 'pink']

export function getStoredTheme() {
  return localStorage.getItem('chatai-theme') || 'classic'
}

export function applyTheme(theme) {
  const html = document.documentElement
  THEMES.forEach((t) => html.classList.remove(`theme-${t}`))
  let effective = theme
  if (theme === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'classic'
  }
  if (effective !== 'classic') html.classList.add(`theme-${effective}`)
  localStorage.setItem('chatai-theme', theme)
}
