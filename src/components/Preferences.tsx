interface PreferencesProps {
  showNotification: boolean
  onNotificationChange: (value: boolean) => void
}

export function Preferences({ showNotification, onNotificationChange }: PreferencesProps) {
  const handleQuit = () => {
    window.close()
  }

  return (
    <div className="preferences">
      <div className="preference-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showNotification}
            onChange={(event) => onNotificationChange(event.target.checked)}
          />
          <span>입력 소스 변경 시 알림 표시</span>
        </label>
        <p className="preference-description">
          단축키로 입력 소스를 변경할 때 macOS 알림을 표시합니다.
        </p>
      </div>

      <div className="preference-actions">
        <button type="button" className="quit-button" onClick={handleQuit}>
          Kawa 종료
        </button>
      </div>

      <div className="about">
        <p className="version">Kawa v2.0.0</p>
        <p className="credits">
          <a href="https://github.com/hatashiro/kawa" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
