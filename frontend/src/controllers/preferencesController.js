import { useEffect, useLayoutEffect } from 'react'
import {
  loadPreferences,
  PREFERENCE_CHANGE_EVENT,
} from '../models/accountSettingsModel.js'

/** Applies the persisted account theme for every route and browser tab. */
export function usePreferencesBootstrapController() {
  const applyPreferences = (preferences) => {
    const effectiveTheme = preferences.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferences.theme
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    document.documentElement.setAttribute('data-accent', preferences.accent)
    document.documentElement.setAttribute('data-font-size', preferences.accessibility.fontSize)
    document.documentElement.removeAttribute('data-reduced-motion')
    document.documentElement.toggleAttribute('data-high-contrast', preferences.accessibility.highContrast)
  }

  useLayoutEffect(() => {
    applyPreferences(loadPreferences())
  }, [])

  useEffect(() => {
    const applyTheme = (event) => {
      applyPreferences(event?.detail || loadPreferences())
    }
    window.addEventListener(PREFERENCE_CHANGE_EVENT, applyTheme)
    window.addEventListener('storage', applyTheme)
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystemTheme = () => {
      const preferences = loadPreferences()
      if (preferences.theme === 'system') applyPreferences(preferences)
    }
    systemTheme.addEventListener('change', applySystemTheme)
    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, applyTheme)
      window.removeEventListener('storage', applyTheme)
      systemTheme.removeEventListener('change', applySystemTheme)
    }
  }, [])
}
