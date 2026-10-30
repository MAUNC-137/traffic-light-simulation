import { useEffect } from 'react'

export interface PreviewModalData {
  image: string
  title: string
  lane: string
  plate?: string
  typeLabel?: string
  time: string
  phase: string
  cloudUrl?: string
}

interface Props {
  data: PreviewModalData | null
  onClose: () => void
}

export function ViolationPreviewModal({ data, onClose }: Props) {
  useEffect(() => {
    if (!data) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [data, onClose])

  if (!data) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
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
              {data.title}
            </span>
            {data.plate && <span className="plate-badge">{data.plate}</span>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-neutral btn-sm"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Modal Body: Large CCTV Proof Photo */}
        <div style={{ padding: 14, background: '#04060a', display: 'flex', justifyContent: 'center' }}>
          <img
            src={data.image}
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

        {/* Modal Footer: Telemetry Info & Download Action */}
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
          <div style={{ display: 'flex', gap: 14, color: 'var(--text-muted)' }}>
            <span>
              Jalur: <b style={{ color: '#f1f5f9' }}>{data.lane}</b>
            </span>
            <span>
              Fase Lampu: <b style={{ color: '#ef4444' }}>{data.phase}</b>
            </span>
            <span>
              Waktu Jepret: <b style={{ color: '#38bdf8' }}>{data.time}</b>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={data.image}
              download={`bukti-pelanggaran-${data.plate || 'kendaraan'}.png`}
              className="btn btn-emerald btn-sm"
            >
              <span>⬇ Unduh Bukti</span>
            </a>

            {data.cloudUrl && (
              <a
                href={data.cloudUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sky btn-sm"
              >
                Cloudinary ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
