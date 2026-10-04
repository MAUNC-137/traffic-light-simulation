import { useState, useEffect } from 'react'
import { useArenaStore } from '../../store/arenaStore'
import type { PhaseSource } from '../../store/arenaStore'

interface PreviewModalData {
  image: string
  title: string
  lane: string
  plate?: string
  typeLabel?: string
  time: string
  phase: string
  cloudUrl?: string
}

export function ViolationLogPanel() {
  const logs = useArenaStore((s) => s.logs)
  const clear = useArenaStore((s) => s.clearLogs)
  const [filter, setFilter] = useState<'all' | PhaseSource>('all')
  const [previewModal, setPreviewModal] = useState<PreviewModalData | null>(null)

  const filteredLogs = logs.filter((l) => (filter === 'all' ? true : l.source === filter))

  const countSim = logs.filter((l) => l.source === 'sim').length
  const countHw = logs.filter((l) => l.source === 'hardware').length

  // Tutup modal jika tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewModal(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <aside
        style={{
          position: 'fixed',
          right: 16,
          top: 16,
          bottom: 16,
          height: 'calc(100vh - 32px)',
          maxHeight: 'calc(100vh - 32px)',
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          background: 'rgba(10, 13, 20, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 22,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0d111a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: '#f1f5f9' }}>
              LOG PELANGGARAN
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                background: '#1e2638',
                color: '#94a3b8',
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
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
              }}
            >
              Hapus Log
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            flexShrink: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            padding: '6px 10px',
            gap: 6,
            background: '#080a0f',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? '#182030' : 'transparent',
              color: filter === 'all' ? '#f1f5f9' : '#64748b',
              border: 'none',
              borderRadius: 6,
              padding: '5px 0',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? 700 : 500,
            }}
          >
            Semua ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('sim')}
            style={{
              background: filter === 'sim' ? '#0e263d' : 'transparent',
              color: filter === 'sim' ? '#38bdf8' : '#64748b',
              border: 'none',
              borderRadius: 6,
              padding: '5px 0',
              cursor: 'pointer',
              fontWeight: filter === 'sim' ? 700 : 500,
            }}
          >
            Simulasi ({countSim})
          </button>
          <button
            type="button"
            onClick={() => setFilter('hardware')}
            style={{
              background: filter === 'hardware' ? '#2d1519' : 'transparent',
              color: filter === 'hardware' ? '#f87171' : '#64748b',
              border: 'none',
              borderRadius: 6,
              padding: '5px 0',
              cursor: 'pointer',
              fontWeight: filter === 'hardware' ? 700 : 500,
            }}
          >
            Fisik ({countHw})
          </button>
        </div>

        {/* Log Feed Scroll Container */}
        <div
          style={{
            flex: '1 1 0px',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px 10px 16px 12px',
          }}
        >
          {filteredLogs.length === 0 ? (
            <div
              style={{
                color: '#475569',
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
              <div style={{ fontSize: 11, color: '#334155' }}>
                {filter === 'hardware'
                  ? 'Deteksi sensor ultrasonik Arduino akan tampil di sini.'
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
                    {/* Header item */}
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
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        fontFamily: 'var(--font-mono)',
                        background: isSim ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                        color: isSim ? '#38bdf8' : '#f87171',
                        border: `1px solid ${isSim ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                      }}
                    >
                      {isSim ? '● SIMULASI 3D' : '⚡ SENSOR FISIK'}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {l.time}
                    </span>
                  </div>

                  {/* Content Body */}
                  <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9' }}>
                        Jalur {laneLabel}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>
                        LAMPU {l.phase}
                      </div>
                    </div>

                    {/* Info Deteksi Kendaraan Pelanggar */}
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
                          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{l.vehicleInfo.typeLabel}</span>
                        </div>
                        <span
                          style={{
                            background: '#0284c7',
                            color: '#f0f9ff',
                            padding: '1px 6px',
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: 10.5,
                          }}
                        >
                          {l.vehicleInfo.plate}
                        </span>
                      </div>
                    )}

                    {/* Kondisi Jika Simulasi (Ada Snapshot Kamera CCTV) */}
                    {isSim ? (
                      <div>
                        {l.image ? (
                          <div
                            onClick={() =>
                              setPreviewModal({
                                image: l.image!,
                                title: `BUKTI PELANGGARAN CCTV // ${l.vehicleInfo?.typeLabel?.toUpperCase() || 'KENDARAAN'}`,
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
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#38bdf8'
                              e.currentTarget.style.transform = 'scale(1.015)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                            title="Klik untuk memperbesar foto bukti pelanggaran"
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <span>🔍 Klik untuk Perbesar</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>
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
                      /* Kondisi Jika Hardware Fisik (Tanpa Pemotretan Kamera 3D) */
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
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>⚠️ Terdeteksi Sensor Ultrasonik Arduino</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>
                          Jarak &le; 4 cm saat lampu merah. Sinyal dikirim langsung dari mikrokontroler (Snapshot kamera 3D dinonaktifkan).
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

      {/* Lightbox Modal Pratinjau Foto Bukti Pelanggaran Full-Size */}
      {previewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(2, 4, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setPreviewModal(null)}
        >
          <div
            style={{
              background: '#0d111a',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 14,
              overflow: 'hidden',
              maxWidth: 960,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#080b12',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 15 }}>🔴</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: '0.04em', color: '#f1f5f9' }}>
                  {previewModal.title}
                </span>
                {previewModal.plate && (
                  <span
                    style={{
                      background: '#0284c7',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  >
                    {previewModal.plate}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                style={{
                  background: '#1e2638',
                  color: '#94a3b8',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ✕ Tutup
              </button>
            </div>

            {/* Modal Body / Large Photo */}
            <div style={{ padding: 14, background: '#04060a', display: 'flex', justifyContent: 'center' }}>
              <img
                src={previewModal.image}
                alt="Bukti Foto Pelanggaran Penuh"
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Modal Footer / Telemetry Data */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0a0e16',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', gap: 14, color: '#94a3b8' }}>
                <span>Jalur: <b style={{ color: '#f1f5f9' }}>{previewModal.lane}</b></span>
                <span>Fase Lampu: <b style={{ color: '#ef4444' }}>{previewModal.phase}</b></span>
                <span>Waktu Jepret: <b style={{ color: '#38bdf8' }}>{previewModal.time}</b></span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={previewModal.image}
                  download={`bukti-pelanggaran-${previewModal.plate || 'kendaraan'}.png`}
                  style={{
                    background: '#047857',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>⬇ Unduh Foto</span>
                </a>

                {previewModal.cloudUrl && (
                  <a
                    href={previewModal.cloudUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Cloudinary ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
