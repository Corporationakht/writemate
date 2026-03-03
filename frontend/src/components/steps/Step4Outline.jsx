import { useState } from 'react'
import { generateOutline } from '../../lib/api'

export default function Step4Outline({ data, onChange, onNext }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const outline = data.outline || []
    const title = data.useCustomTitle ? data.customTitle : data.selectedTitle

    const handleGenerate = async () => {
        setLoading(true)
        setError('')
        try {
            const { outline: o } = await generateOutline({
                title,
                type: data.type,
                references: data.selectedRefs || [],
            })
            onChange({ outline: o })
        } catch (e) {
            setError('Gagal generate kerangka. ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const updateChapter = (idx, key, val) => {
        const updated = outline.map((ch, i) => i === idx ? { ...ch, [key]: val } : ch)
        onChange({ outline: updated })
    }

    const updateSubsection = (chIdx, subIdx, val) => {
        const updated = outline.map((ch, i) => {
            if (i !== chIdx) return ch
            const subs = [...(ch.subsections || [])]
            subs[subIdx] = val
            return { ...ch, subsections: subs }
        })
        onChange({ outline: updated })
    }

    const addSubsection = (chIdx) => {
        const updated = outline.map((ch, i) => {
            if (i !== chIdx) return ch
            return { ...ch, subsections: [...(ch.subsections || []), 'Subbab Baru'] }
        })
        onChange({ outline: updated })
    }

    const removeSubsection = (chIdx, subIdx) => {
        const updated = outline.map((ch, i) => {
            if (i !== chIdx) return ch
            return { ...ch, subsections: ch.subsections.filter((_, si) => si !== subIdx) }
        })
        onChange({ outline: updated })
    }

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Generate Kerangka
            </h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>
                AI akan membuat outline berdasarkan jenis karya tulis. Kamu bisa edit setelah di-generate.
            </p>

            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginBottom: 24 }}>
                {loading ? <><span className="loading-spinner" style={{ marginRight: 8 }} /> Generating...</> : '📋 Generate Kerangka'}
            </button>

            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}

            {outline.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {outline.map((chapter, ci) => (
                        <div key={ci} style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,102,241,0.15)',
                            borderRadius: 12, padding: 16,
                        }}>
                            {/* Chapter title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: 'white', width: 28, height: 28, borderRadius: 7,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                                }}>{ci + 1}</span>
                                <input
                                    className="input-field"
                                    value={chapter.title}
                                    onChange={(e) => updateChapter(ci, 'title', e.target.value)}
                                    style={{ fontWeight: 600, fontSize: 14, padding: '8px 12px' }}
                                />
                            </div>

                            {/* Subsections */}
                            {chapter.subsections && chapter.subsections.length > 0 && (
                                <div style={{ paddingLeft: 38, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {chapter.subsections.map((sub, si) => (
                                        <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ color: '#4b5563', fontSize: 14, flexShrink: 0 }}>•</span>
                                            <input
                                                className="input-field"
                                                value={sub}
                                                onChange={(e) => updateSubsection(ci, si, e.target.value)}
                                                style={{ fontSize: 13, padding: '6px 10px' }}
                                            />
                                            <button onClick={() => removeSubsection(ci, si)} style={{
                                                background: 'none', border: 'none', color: '#4b5563',
                                                cursor: 'pointer', fontSize: 16, flexShrink: 0,
                                                padding: '0 4px',
                                            }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={() => addSubsection(ci)} style={{
                                background: 'none', border: '1px dashed rgba(99,102,241,0.3)',
                                color: '#6366f1', cursor: 'pointer', fontSize: 12, padding: '4px 12px',
                                borderRadius: 6, marginTop: 8, marginLeft: 38,
                            }}>+ Tambah Subbab</button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={onNext} disabled={outline.length === 0}>
                    Lanjut →
                </button>
            </div>
        </div>
    )
}
