export interface AlertData {
  type: 'sim' | 'hardware'
  title: string
  message: string
  buzzerNotice: string
  vehiclePlate?: string
  vehicleType?: string
}

interface Props {
  alert: AlertData | null
  isConnected: boolean
}

export function AlertBanner({ alert, isConnected }: Props) {
  if (!alert) return null

  return (
    <div className={`alert-banner ${alert.type}`}>
      <div className="alert-icon">
        {alert.type === 'sim' ? '🚨' : '⚡'}
      </div>

      <div className="alert-content">
        <div className="alert-header">
          <span className={`alert-title ${alert.type}`}>
            {alert.title}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>·</span>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: isConnected ? '#4ade80' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {alert.buzzerNotice}
          </span>
        </div>
        <div className="alert-message">
          <span>{alert.message}</span>
          {alert.vehiclePlate && (
            <span className="plate-badge">{alert.vehiclePlate}</span>
          )}
        </div>
      </div>
    </div>
  )
}
