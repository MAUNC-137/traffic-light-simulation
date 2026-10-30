import { useState } from 'react'
import { useArenaStore } from '../../store/arenaStore'
import type { PhaseSource } from '../../store/arenaStore'
import { ViolationPreviewModal, type PreviewModalData } from './ViolationPreviewModal'

export function ViolationLogPanel() {
  const logs = useArenaStore((s) => s.logs)
  const clear = useArenaStore((s) => s.clearLogs)
  const [filter, setFilter] = useState<'all' | PhaseSource>('all')
  const [previewModal, setPreviewModal] = useState<PreviewModalData | null>(null)

  const filteredLogs = logs.filter((l) => (filter === 'all' ? true : l.source === filter))
  const countSim = logs.filter((l) => l.source === 'sim').length
  const countHw = logs.filter((l) => l.source === 'hardware').length

  return (
    <>
      <aside className="log-panel">
        {/* Header */}
        <div className="log-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-main)' }}>
              LOG PELANGGARAN
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                background: '#1e2638',
                color: 'var(--text-muted)',
                padding: '2px 7px',
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              {logs.length}
            </span>
          </div>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="btn btn-neutral btn-sm"
              title="Bersihkan semua riwayat pelanggaran"
            >
              Hapus Log
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="log-filter-bar">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active-all' : ''}`}
          >
            Semua ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('sim')}
            className={`filter-tab ${filter === 'sim' ? 'active-sim' : ''}`}
          >
            Simulasi ({countSim})
          </button>
          <button
            type="button"
            onClick={() => setFilter('hardware')}
            className={`filter-tab ${filter === 'hardware' ? 'active-hardware' : ''}`}
          >
            Fisik ({countHw})
          </button>
        </div>

        {/* Feed List */}
        <div className="log-feed">
          {filteredLogs.length === 0 ? (
            <div
              style={{
                color: 'var(--text-dim)',
                fontSize: 12,
                textAlign: 'center',
                padding: '36px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 22, opacity: 0.5 }}>✓</div>
              <div>Belum ada data pelanggaran tercatat.</div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                {filter === 'hardware'
                  ? 'Deteksi sensor ultrasonik Arduino fisik akan tampil di sini.'
                  : 'Mobil simulasi yang menerobos lampu merah akan tampil di sini.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
              {filteredLogs.map((l) => {
                const isSim = l.source === 'sim'
                const laneLabel = l.lane === 'west' ? 'Barat (TL2)' : l.lane === 'east' ? 'Timur (TL1)' : 'Utara (TL3)'

                return (
                  <div
                    key={l.id}
                    style={{
                      flexShrink: 0,
                      background: isSim ? '#0c111a' : '#140d10',
                      border: `1px solid ${isSim ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.25)'}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: 12,
                    }}
                  >
                    {/* Log Card Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        background: isSim ? '#0f1726' : '#1f1013',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <span
                        className="mode-tag"
                        style={{
                          background: isSim ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                          color: isSim ? '#38bdf8' : '#f87171',
                          border: `1px solid ${isSim ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                        }}
                      >
                        {isSim ? '● SIMULASI 3D' : '⚡ SENSOR FISIK'}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        {l.time}
                      </span>
                    </div>

                    {/* Log Card Body */}
                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          Jalur {laneLabel}
                        </div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>
                          LAMPU {l.phase}
                        </div>
                      </div>

                      {/* Vehicle Metadata */}
                      {l.vehicleInfo && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'rgba(56, 189, 248, 0.08)',
                            borderRadius: 6,
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: l.vehicleInfo.color,
                                border: '1px solid rgba(255,255,255,0.4)',
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                              {l.vehicleInfo.typeLabel}
                            </span>
                          </div>
                          <span className="plate-badge">{l.vehicleInfo.plate}</span>
                        </div>
                      )}

                      {/* Evidence Photo for Simulation */}
                      {isSim ? (
                        <div>
                          {l.image ? (
                            <div
                              onClick={() =>
                                setPreviewModal({
                                  image: l.image!,
                                  title: `BUKTI PELANGGARAN // ${l.vehicleInfo?.typeLabel?.toUpperCase() || 'KENDARAAN'}`,
                                  lane: laneLabel,
                                  plate: l.vehicleInfo?.plate,
                                  typeLabel: l.vehicleInfo?.typeLabel,
                                  time: l.time,
                                  phase: l.phase,
                                  cloudUrl: l.cloudUrl,
                                })
                              }
                              style={{
                                marginTop: 4,
                                position: 'relative',
                                borderRadius: 6,
                                overflow: 'hidden',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease, border-color 0.15s ease',
                              }}
                              title="Klik untuk memperbesar foto bukti CCTV"
                            >
                              <img
                                src={l.image}
                                alt="Bukti CCTV Simulasi"
                                style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', background: '#000' }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 4,
                                  left: 6,
                                  background: 'rgba(0,0,0,0.75)',
                                  color: '#38bdf8',
                                  fontSize: 9.5,
                                  fontFamily: 'var(--font-mono)',
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                }}
                              >
                                🔍 Klik untuk Perbesar
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic', padding: '6px 0' }}>
                              Memproses snapshot kamera 3D...
                            </div>
                          )}

                          {l.cloudUrl && (
                            <a
                              href={l.cloudUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-block',
                                marginTop: 6,
                                fontSize: 10,
                                color: '#60a5fa',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              🔗 Buka Bukti Cloudinary ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 2,
                            padding: '8px 10px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            borderRadius: 6,
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            fontSize: 11,
                            color: '#fca5a5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>
                            ⚠️ Terdeteksi Sensor Ultrasonik Arduino
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            Jarak &le; 4 cm saat lampu merah. Sinyal dikirim langsung dari mikrokontroler.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <ViolationPreviewModal data={previewModal} onClose={() => setPreviewModal(null)} />
    </>
  )
}
