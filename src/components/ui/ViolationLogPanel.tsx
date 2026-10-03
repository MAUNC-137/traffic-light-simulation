import { useArenaStore } from '../../store/arenaStore'

export function ViolationLogPanel() {
  const logs = useArenaStore((s) => s.logs)
  const clear = useArenaStore((s) => s.clearLogs)

  return (
    <div
      style={{
        position: 'fixed',
        right: 14,
        top: 14,
        bottom: 14,
        width: 340,
        maxWidth: '92vw',
        background: 'rgba(12,14,20,.92)',
        border: '1px solid #1f2433',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 22,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #1f2433', background: '#0f1117' }}>
        <div style={{ fontWeight: 900, color: '#e2e8f0', fontSize: 13, letterSpacing: 0.4 }}>VIOLATION LOGS</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{logs.length}</span>
          <button type="button" onClick={clear} style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 8, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>Clear</button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
        {logs.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: 18 }}>Belum ada pelanggaran</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} style={{ background: '#111318', border: '1px solid #1e2433', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: l.image ? '96px 1fr' : '1fr', gap: 10 }}>
                {l.image ? <img src={l.image} alt={l.lane} style={{ width: 96, height: 72, objectFit: 'cover', background: '#000' }} /> : null}
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11, color: '#f87171', fontWeight: 900 }}>LANGGAR {l.lane.toUpperCase()} ({l.tl})</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>Fase: {l.phase}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.time} · {l.source}</div>
                </div>
              </div>
              {l.cloudUrl ? (
                <a href={l.cloudUrl} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 10, color: '#60a5fa', padding: '0 8px 8px', wordBreak: 'break-all' }}>
                  {l.cloudUrl}
                </a>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
