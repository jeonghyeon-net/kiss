import {
  app,
  BrowserWindow,
  Tray,
  globalShortcut,
  ipcMain,
  Notification,
  nativeImage,
} from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { InputSourceManager } from './input-source'

interface ShortcutConfig {
  [inputSourceId: string]: string
}

interface StoreSchema {
  shortcuts: ShortcutConfig
  showNotification: boolean
  launchedBefore: boolean
}

const store = new Store<StoreSchema>({
  defaults: {
    shortcuts: {},
    showNotification: true,
    launchedBefore: false,
  },
})

const translations = {
  ko: {
    notificationBody: (name: string) => `입력 소스 변경: ${name}`,
  },
  en: {
    notificationBody: (name: string) => `Input source changed: ${name}`,
  },
}

function getLocale(): 'ko' | 'en' {
  const locale = app.getLocale()
  return locale.startsWith('ko') ? 'ko' : 'en'
}

function t(key: keyof typeof translations.en, ...args: string[]): string {
  const locale = getLocale()
  const fn = translations[locale][key]
  return fn(...args)
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const inputSourceManager = new InputSourceManager()

const DIST = join(__dirname, '../dist')
const ELECTRON_DIST = __dirname

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 260,
    height: 200,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    closable: false,
    title: 'KISS',
    frame: false,
    transparent: true,
    vibrancy: 'popover',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(ELECTRON_DIST, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(DIST, 'index.html'))
  }

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.on('blur', () => {
    mainWindow?.hide()
  })
}

function createTray() {
  const isDev = !app.isPackaged
  const iconPath = isDev
    ? join(__dirname, '../resources/trayTemplate.png')
    : join(process.resourcesPath, 'trayTemplate.png')
  const icon = nativeImage.createFromPath(iconPath)
  icon.setTemplateImage(true)

  tray = new Tray(icon)
  tray.setToolTip('KISS')

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      showWindow()
    }
  })
}

function showWindow() {
  if (!mainWindow) return

  const trayBounds = tray?.getBounds()
  if (trayBounds) {
    const windowBounds = mainWindow.getBounds()
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
    const y = Math.round(trayBounds.y + trayBounds.height)
    mainWindow.setPosition(x, y)
  }

  mainWindow.show()
  mainWindow.focus()
}

function registerShortcuts() {
  globalShortcut.unregisterAll()

  const shortcuts = store.get('shortcuts')

  for (const [inputSourceId, shortcut] of Object.entries(shortcuts)) {
    if (!shortcut) continue

    try {
      globalShortcut.register(shortcut, () => {
        const success = inputSourceManager.selectInputSource(inputSourceId)
        if (success && store.get('showNotification')) {
          const sources = inputSourceManager.getInputSources()
          const source = sources.find((s) => s.id === inputSourceId)
          if (source) {
            new Notification({
              title: 'KISS',
              body: t('notificationBody', source.name),
              silent: true,
            }).show()
          }
        }
      })
    } catch {
      console.error(`Failed to register shortcut: ${shortcut}`)
    }
  }
}

ipcMain.handle('get-input-sources', () => {
  return inputSourceManager.getInputSources()
})

ipcMain.handle('get-shortcuts', () => {
  return store.get('shortcuts')
})

ipcMain.handle('set-shortcut', (_, inputSourceId: string, shortcut: string) => {
  const shortcuts = store.get('shortcuts')
  shortcuts[inputSourceId] = shortcut
  store.set('shortcuts', shortcuts)
  registerShortcuts()
  return true
})

ipcMain.handle('remove-shortcut', (_, inputSourceId: string) => {
  const shortcuts = store.get('shortcuts')
  delete shortcuts[inputSourceId]
  store.set('shortcuts', shortcuts)
  registerShortcuts()
  return true
})

ipcMain.handle('get-show-notification', () => {
  return store.get('showNotification')
})

ipcMain.handle('set-show-notification', (_, value: boolean) => {
  store.set('showNotification', value)
  return true
})

ipcMain.handle('get-launch-at-login', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('set-launch-at-login', (_, value: boolean) => {
  app.setLoginItemSettings({ openAtLogin: value })
  return true
})

ipcMain.handle('select-input-source', (_, inputSourceId: string) => {
  return inputSourceManager.selectInputSource(inputSourceId)
})

ipcMain.handle('quit-app', () => {
  mainWindow?.destroy()
  app.quit()
})

app.whenReady().then(() => {
  createTray()
  createWindow()
  registerShortcuts()

  const launchedBefore = store.get('launchedBefore')
  if (!launchedBefore) {
    store.set('launchedBefore', true)
    showWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  if (!mainWindow) {
    createWindow()
  }
  showWindow()
})
