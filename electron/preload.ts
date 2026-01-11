import { contextBridge, ipcRenderer } from 'electron'

export interface InputSource {
  id: string
  name: string
  localizedName: string
}

export interface KawaAPI {
  getInputSources: () => Promise<InputSource[]>
  getShortcuts: () => Promise<Record<string, string>>
  setShortcut: (inputSourceId: string, shortcut: string) => Promise<boolean>
  removeShortcut: (inputSourceId: string) => Promise<boolean>
  getShowNotification: () => Promise<boolean>
  setShowNotification: (value: boolean) => Promise<boolean>
  getLaunchAtLogin: () => Promise<boolean>
  setLaunchAtLogin: (value: boolean) => Promise<boolean>
  selectInputSource: (inputSourceId: string) => Promise<boolean>
  quitApp: () => Promise<void>
}

const api: KawaAPI = {
  getInputSources: () => ipcRenderer.invoke('get-input-sources'),
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  setShortcut: (inputSourceId, shortcut) =>
    ipcRenderer.invoke('set-shortcut', inputSourceId, shortcut),
  removeShortcut: (inputSourceId) => ipcRenderer.invoke('remove-shortcut', inputSourceId),
  getShowNotification: () => ipcRenderer.invoke('get-show-notification'),
  setShowNotification: (value) => ipcRenderer.invoke('set-show-notification', value),
  getLaunchAtLogin: () => ipcRenderer.invoke('get-launch-at-login'),
  setLaunchAtLogin: (value) => ipcRenderer.invoke('set-launch-at-login', value),
  selectInputSource: (inputSourceId) => ipcRenderer.invoke('select-input-source', inputSourceId),
  quitApp: () => ipcRenderer.invoke('quit-app'),
}

contextBridge.exposeInMainWorld('kawa', api)
