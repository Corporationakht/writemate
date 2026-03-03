import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { exportDoc, exportPdf } from '../../lib/api'
import { saveToHistory } from '../../lib/storage'

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export default function Step7Preview({ data }) {
    const [loadingDoc, setLoadingDoc] = useState(false)
    const [loadingPdf, setLoadingPdf] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [previewMode, setPreviewMode] = useState('formatted')

    const title = data.useCustomTitle ? data.customTitle : data.selectedTitle
    const outline = data.outline || []
    const chapters = data.chapters || {}

    const generatable = outline.filter(
        (ch) => !['cover', 'toc', 'references', 'appendix'].includes(ch.type)
    )

    const payload = {
        title,
        chapters: generatable.map((ch) => ({
            title: ch.title,
            content: chapters[ch.id] || '',
        })),
    }

    const totalWords = Object.values(chapters).join(' ').split(/\s+/).filter(Boolean).length

    const handleDoc = async () => {
        setLoadingDoc(true)
        setError('')
        try {
            const blob = await exportDoc(payload)
            const safe = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 60)
            downloadBlob(blob, `${safe}.docx`)
        } catch (e) {
            setError('Gagal download DOC: ' + e.message)
        } finally {
            setLoadingDoc(false)
        }
    }

    const handlePdf = async () => {
        setLoadingPdf(true)
        setError('')
        try {
            const blob = await exportPdf(payload)
            const safe = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 60)
            downloadBlob(blob, `${safe}.pdf`)
        } catch (e) {
            setError('Gagal download PDF: ' + e.message)
        } finally {
            setLoadingPdf(false)
        }
    }

    const handleSave = () => {
        saveToHistory({
            title,
            type: data.type,
            outline: data.outline,
            chapters: data.chapters,
            chapterStatuses: data.chapterStatuses,
            selectedRefs: data.selectedRefs,
            language: data.language,
            audience: data.audience,
            totalWords,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const handleBibtex = () => {
        const refs = data.selectedRefs || []
        if (refs.length === 0) {
            setError('Tidak ada referensi yang dipilih untuk diexport.')
            return
        }

        let bibContent = ''
        refs.forEach((r, i) => {
            const key = (r.authors ? r.authors.split(',')[0].split(' ').pop() : 'Anonim') + (r.year || '0000') + i
            bibContent += `@article{${key.replace(/[^a-zA-Z0-9]/g, '')},
    author = {${r.authors || 'Unknown'}},
    title = {${r.title || 'Untitled'}},
    year = {${r.year || 'unknown'}},
    doi = {${r.doi || ''}}
}

`
        })

        const blob = new Blob([bibContent], { type: 'text/plain' })
        const safe = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 60)
        downloadBlob(blob, `${safe}.bib`)
    }

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Preview & Export
            </h2>
            <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
                Review dokumen lengkap kemudian download dalam format yang kamu inginkan.
            </p>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                    { label: 'Bab', val: generatable.length },
                    { label: 'Kata', val: totalWords.toLocaleString() },
                    { label: 'Jenis', val: data.type?.replace('_', ' ') },
                ].map(({ label, val }) => (
                    <div key={label} style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 8, padding: '8px 16px',
                    }}>
                        <span style={{ color: '#64748b', fontSize: 11 }}>{label} </span>
                        <span style={{ color: '#a5b4fc', fontSize: 14, fontWeight: 700 }}>{val}</span>
                    </div>
                ))}
            </div>

            {/* Export buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={handleDoc} disabled={loadingDoc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {loadingDoc ? <span className="loading-spinner" /> : '📝'} Download DOC
                </button>
                <button className="btn-primary" onClick={handlePdf} disabled={loadingPdf} style={{ background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {loadingPdf ? <span className="loading-spinner" /> : '📄'} Download PDF
                </button>
                {(data.selectedRefs && data.selectedRefs.length > 0) && (
                    <button className="btn-primary" onClick={handleBibtex} style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        📚 Download .bib
                    </button>
                )}
                <button
                    className="btn-secondary"
                    onClick={handleSave}
                    style={{ borderColor: saved ? 'rgba(16,185,129,0.5)' : undefined, color: saved ? '#10b981' : undefined }}
                >
                    {saved ? '✓ Tersimpan!' : '💾 Simpan ke Riwayat'}
                </button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            {/* Preview toggle */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {['formatted', 'raw'].map((m) => (
                    <button key={m} onClick={() => setPreviewMode(m)} style={{
                        background: previewMode === m ? 'rgba(99,102,241,0.15)' : 'transparent',
                        border: `1px solid ${previewMode === m ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        color: previewMode === m ? '#a5b4fc' : '#64748b',
                        padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    }}>
                        {m === 'formatted' ? '📖 Formatted' : '📝 Plain Text'}
                    </button>
                ))}
            </div>

            {/* Preview content */}
            <div style={{
                background: '#0e0e28', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 12, padding: '28px 32px', maxHeight: 560, overflowY: 'auto',
            }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 32, textAlign: 'center', lineHeight: 1.4 }}>
                    {title}
                </h1>

                {generatable.map((ch) => (
                    <div key={ch.id} style={{ marginBottom: 32 }}>
                        <h2 style={{
                            fontSize: 16, fontWeight: 700, color: '#a5b4fc',
                            marginBottom: 16, paddingBottom: 8,
                            borderBottom: '1px solid rgba(99,102,241,0.2)',
                        }}>
                            {ch.title}
                        </h2>
                        {chapters[ch.id] ? (
                            previewMode === 'formatted' ? (
                                <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: 14 }}>
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ children }) => <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>{children}</h3>,
                                            h3: ({ children }) => <h4 style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>{children}</h4>,
                                            p: ({ children }) => <p style={{ marginBottom: 12, textAlign: 'justify', textIndent: 24 }}>{children}</p>,
                                        }}
                                    >
                                        {chapters[ch.id]}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <pre style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                    {chapters[ch.id]}
                                </pre>
                            )
                        ) : (
                            <p style={{ color: '#374151', fontSize: 13, fontStyle: 'italic' }}>Bab belum digenerate.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
