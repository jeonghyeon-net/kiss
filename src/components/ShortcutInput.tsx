import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ShortcutInputProps {
  value: string
  onChange: (shortcut: string) => void
}

const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift'])

const KEY_DISPLAY_MAP: Record<string, string> = {
  Meta: '⌘',
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backspace: '⌫',
  Delete: '⌦',
  Enter: '↩',
  Tab: '⇥',
  Escape: '⎋',
  Space: '␣',
}

function formatShortcutForElectron(modifiers: Set<string>, key: string): string {
  const parts: string[] = []

  if (modifiers.has('Meta')) parts.push('CommandOrControl')
  if (modifiers.has('Alt')) parts.push('Alt')
  if (modifiers.has('Control') && !modifiers.has('Meta')) parts.push('Control')
  if (modifiers.has('Shift')) parts.push('Shift')

  const keyName = key.length === 1 ? key.toUpperCase() : key
  parts.push(keyName)

  return parts.join('+')
}

function formatShortcutForDisplay(shortcut: string): string {
  if (!shortcut) return ''

  const parts = shortcut.split('+')
  const displayParts = parts.map((part) => {
    if (part === 'CommandOrControl') return '⌘'
    return KEY_DISPLAY_MAP[part] ?? part
  })

  return displayParts.join('')
}

export function ShortcutInput({ value, onChange }: ShortcutInputProps) {
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = useState(false)
  const [pressedModifiers, setPressedModifiers] = useState<Set<string>>(new Set())
  const recordingRef = useRef(false)
  const modifiersRef = useRef<Set<string>>(new Set())
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    recordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    modifiersRef.current = pressedModifiers
  }, [pressedModifiers])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!recordingRef.current) return
      const target = event.target as HTMLElement
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        setIsRecording(false)
        setPressedModifiers(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!recordingRef.current) return

      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        setIsRecording(false)
        setPressedModifiers(new Set())
        return
      }

      if (MODIFIER_KEYS.has(event.key)) {
        setPressedModifiers((prev) => new Set([...prev, event.key]))
        return
      }

      if (modifiersRef.current.size > 0) {
        const shortcut = formatShortcutForElectron(modifiersRef.current, event.key)
        onChange(shortcut)
        setIsRecording(false)
        setPressedModifiers(new Set())
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!recordingRef.current) return

      if (MODIFIER_KEYS.has(event.key)) {
        setPressedModifiers((prev) => {
          const next = new Set(prev)
          next.delete(event.key)
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [onChange])

  const handleClick = () => {
    setIsRecording(true)
    setPressedModifiers(new Set())
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange('')
    setIsRecording(false)
    setPressedModifiers(new Set())
  }

  const displayValue = isRecording
    ? pressedModifiers.size > 0
      ? Array.from(pressedModifiers)
          .map((key) => KEY_DISPLAY_MAP[key] ?? key)
          .join('')
      : t('recording')
    : formatShortcutForDisplay(value) || t('setShortcut')

  return (
    <div className="shortcut-input-wrapper">
      <button
        ref={buttonRef}
        type="button"
        className={`shortcut-input ${isRecording ? 'recording' : ''} ${value ? 'has-value' : ''}`}
        onClick={handleClick}
      >
        {displayValue}
      </button>
      {value && !isRecording && (
        <button type="button" className="clear-button" onClick={handleClear}>
          ×
        </button>
      )}
    </div>
  )
}
