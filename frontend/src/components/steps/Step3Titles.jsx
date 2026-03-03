import { useState } from 'react'
import { generateTitles } from '../../lib/api'

export default function Step3Titles({ data, onChange, onNext }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const titles = data.generatedTitles || []
    const selected = data.selectedTitle || ''
    const custom = data.customTitle || ''
    const useCustom = data.useCustomTitle || false

    const handleGenerate = async () => {
        setLoading(true)
        setError('')
        try {
            const { titles: t } = await generateTitles({
                topic: data.topic,
                type: data.type,
                language: data.language,
                audience: data.audience,
            })
            onChange({ generatedTitles: t, selectedTitle: t[0] || '' })
        } catch (e) {
            setError('Gagal generate judul. Pastikan API key sudah diset di backend/.env')
        } finally {
            setLoading(false)
        }
    }

    const finalTitle = useCustom ? custom : selected

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Generate Ide Judul
            </h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>
                AI akan membuat 5 pilihan judul berdasarkan topik yang kamu masukkan.
            </p>

            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginBottom: 24 }}>
                {loading ? <><span className="loading-spinner" style={{ marginRight: 8 }} /> Generating...</> : '✨ Generate Judul'}
            </button>

            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}

            {/* Generated titles */}
            {titles.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <p className="label" style={{ marginBottom: 12 }}>Pilih salah satu judul:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {titles.map((t, i) => (
                            <label key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                                background: selected === t && !useCustom ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${selected === t && !useCustom ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 10, padding: '14px 16px', transition: 'all 0.2s',
                            }}>
                                <input
                                    type="radio"
                                    name="title"
                                    value={t}
                                    checked={selected === t && !useCustom}
                                    onChange={() => onChange({ selectedTitle: t, useCustomTitle: false })}
                                    style={{ marginTop: 2, accentColor: '#6366f1', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{t}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom title */}
            <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: 16,
            }}>
                <label style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12,
                }}>
                    <input
                        type="checkbox"
                        checked={useCustom}
                        onChange={(e) => onChange({ useCustomTitle: e.target.checked })}
                        style={{ accentColor: '#6366f1', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Gunakan judul sendiri</span>
                </label>
                {useCustom && (
                    <input
                        className="input-field"
                        value={custom}
                        onChange={(e) => onChange({ customTitle: e.target.value })}
                        placeholder="Tulis judul karya tulismu di sini..."
                    />
                )}
            </div>

            {finalTitle && (
                <div style={{
                    marginTop: 16, background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                    padding: '10px 14px', fontSize: 13, color: '#10b981',
                }}>
                    ✓ Judul dipilih: <strong style={{ color: '#e2e8f0' }}>{finalTitle}</strong>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn-primary" onClick={onNext} disabled={!finalTitle}>
                    Lanjut →
                </button>
            </div>
        </div>
    )
}
