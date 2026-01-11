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

declare global {
  interface Window {
    kawa: KawaAPI
  }
}
