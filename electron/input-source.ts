import { execSync } from 'child_process'
import { join } from 'path'
import { app } from 'electron'

export interface InputSource {
  id: string
  name: string
  localizedName: string
}

export class InputSourceManager {
  private helperPath: string

  constructor() {
    const isDev = !app.isPackaged
    this.helperPath = isDev
      ? join(__dirname, '../resources/kawa-helper')
      : join(process.resourcesPath, 'kawa-helper')
  }

  getInputSources(): InputSource[] {
    try {
      const result = execSync(`"${this.helperPath}" list`, {
        encoding: 'utf-8',
        timeout: 5000,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Failed to get input sources:', error)
      return this.getDefaultSources()
    }
  }

  private getDefaultSources(): InputSource[] {
    return [
      { id: 'com.apple.keylayout.ABC', name: 'ABC', localizedName: 'ABC' },
      {
        id: 'com.apple.inputmethod.Korean.2SetKorean',
        name: '2-Set Korean',
        localizedName: '두벌식',
      },
    ]
  }

  selectInputSource(inputSourceId: string): boolean {
    try {
      execSync(`"${this.helperPath}" select "${inputSourceId}"`, {
        encoding: 'utf-8',
        timeout: 5000,
      })
      return true
    } catch (error) {
      console.error('Failed to select input source:', error)
      return false
    }
  }
}
