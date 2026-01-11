import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ShortcutList } from './components/ShortcutList'
import type { InputSource } from './types/global'

export default function App() {
  const { t } = useTranslation()
  const [inputSources, setInputSources] = useState<InputSource[]>([])
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({})
  const [showNotification, setShowNotification] = useState(true)
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [sources, shortcutsData, notificationSetting, loginSetting] =
        await Promise.all([
          window.kawa.getInputSources(),
          window.kawa.getShortcuts(),
          window.kawa.getShowNotification(),
          window.kawa.getLaunchAtLogin(),
        ])
      setInputSources(sources)
      setShortcuts(shortcutsData)
      setShowNotification(notificationSetting)
      setLaunchAtLogin(loginSetting)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleShortcutChange = useCallback(async (inputSourceId: string, shortcut: string) => {
    if (shortcut) {
      await window.kawa.setShortcut(inputSourceId, shortcut)
      setShortcuts((prev) => ({ ...prev, [inputSourceId]: shortcut }))
    } else {
      await window.kawa.removeShortcut(inputSourceId)
      setShortcuts((prev) => {
        const updated = { ...prev }
        delete updated[inputSourceId]
        return updated
      })
    }
  }, [])

  const handleNotificationChange = useCallback(async (value: boolean) => {
    await window.kawa.setShowNotification(value)
    setShowNotification(value)
  }, [])

  const handleLaunchAtLoginChange = useCallback(async (value: boolean) => {
    await window.kawa.setLaunchAtLogin(value)
    setLaunchAtLogin(value)
  }, [])

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="app">
      <main className="content">
        <ShortcutList
          inputSources={inputSources}
          shortcuts={shortcuts}
          onShortcutChange={handleShortcutChange}
        />

        <div className="settings">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={launchAtLogin}
              onChange={(event) => handleLaunchAtLoginChange(event.target.checked)}
            />
            <span>{t('launchAtLogin')}</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showNotification}
              onChange={(event) => handleNotificationChange(event.target.checked)}
            />
            <span>{t('showNotification')}</span>
          </label>
          <button className="quit-button" onClick={() => window.kawa.quitApp()}>
            {t('quit')}
          </button>
        </div>
      </main>
    </div>
  )
}
