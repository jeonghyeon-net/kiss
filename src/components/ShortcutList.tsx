import { useTranslation } from 'react-i18next'
import { ShortcutInput } from './ShortcutInput'
import type { InputSource } from '../types/global'

interface ShortcutListProps {
  inputSources: InputSource[]
  shortcuts: Record<string, string>
  onShortcutChange: (inputSourceId: string, shortcut: string) => void
}

export function ShortcutList({ inputSources, shortcuts, onShortcutChange }: ShortcutListProps) {
  const { t } = useTranslation()

  if (inputSources.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('noInputSources')}</p>
        <p className="hint">{t('noInputSourcesHint')}</p>
      </div>
    )
  }

  return (
    <div className="shortcut-list">
      {inputSources.map((source) => (
        <div key={source.id} className="shortcut-item">
          <div className="source-info">
            <span className="source-name">{source.localizedName || source.name}</span>
            <span className="source-id">{source.id}</span>
          </div>
          <ShortcutInput
            value={shortcuts[source.id] ?? ''}
            onChange={(shortcut) => onShortcutChange(source.id, shortcut)}
          />
        </div>
      ))}
    </div>
  )
}
