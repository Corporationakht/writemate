import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, deleteFromHistory } from '../lib/storage'

const TYPE_LABELS = {
    makalah: 'Makalah',
    essay: 'Essay',
    artikel_ilmiah: 'Artikel Ilmiah',
    laporan_penelitian: 'Laporan Penelitian',
    proposal_skripsi: 'Proposal Skripsi',
}

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
    } catch {
        return iso
    }
}

export default function History() {
    const [items, setItems] = useState(getHistory)
    const [confirm, setConfirm] = useState(null)
    const navigate = useNavigate()

    const handleDelete = (id) => {
        deleteFromHistory(id)
        setItems(getHistory())
        setConfirm(null)
    }

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                        Riwayat <span className="gradient-text">Karya Tulis</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        Dokumen yang pernah disimpan dari sesi generator.
                    </p>
                </div>

                {items.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 24px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                        <h3 style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Belum ada riwayat</h3>
                        <p style={{ color: '#374151', fontSize: 14, marginBottom: 24 }}>
                            Buat karya tulis di Generator, lalu simpan ke riwayat.
                        </p>
                        <button className="btn-primary" onClick={() => navigate('/generate')}>
                            Mulai Sekarang →
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {items.map((item) => (
                            <div key={item.id} className="card-gradient-border" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                            <span style={{
                                                background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                                                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                            }}>
                                                {TYPE_LABELS[item.type] || item.type}
                                            </span>
                                            <span style={{ color: '#374151', fontSize: 12 }}>
                                                📅 {formatDate(item.savedAt)}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: 1.4 }}>
                                            {item.title}
                                        </h3>

                                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                                            <span>📚 {(item.outline || []).length} bab</span>
                                            <span>🔤 {(item.totalWords || 0).toLocaleString()} kata</span>
                                            {item.selectedRefs?.length > 0 && (
                                                <span>📖 {item.selectedRefs.length} referensi</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        {confirm === item.id ? (
                                            <>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', padding: '8px 16px', fontSize: 13 }}
                                                >
                                                    Hapus
                                                </button>
                                                <button className="btn-secondary" onClick={() => setConfirm(null)} style={{ padding: '8px 16px', fontSize: 13 }}>
                                                    Batal
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => setConfirm(item.id)}
                                                    style={{ padding: '8px 16px', fontSize: 13, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                                                >
                                                    🗑 Hapus
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Chapter list preview */}
                                {item.outline && item.outline.length > 0 && (
                                    <div style={{
                                        marginTop: 14, paddingTop: 14,
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', gap: 8, flexWrap: 'wrap',
                                    }}>
                                        {item.outline.filter(ch => !['cover', 'toc', 'references', 'appendix'].includes(ch.type)).map((ch, i) => (
                                            <span key={i} style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                color: '#64748b', padding: '3px 10px',
                                                borderRadius: 99, fontSize: 11,
                                            }}>{ch.title}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
