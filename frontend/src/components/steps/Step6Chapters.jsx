import { useState } from 'react'
import { generateChapterStream } from '../../lib/api'

const STATUS_LABELS = {
    pending: 'Belum dibuat',
    done: 'Sudah dibuat',
    edited: 'Diedit',
}
const STATUS_CLASS = { pending: 'badge-pending', done: 'badge-done', edited: 'badge-edited' }

export default function Step6Chapters({ data, onChange, onFinish }) {
    const outline = data.outline || []
    const chapters = data.chapters || {}
    const statuses = data.chapterStatuses || {}
    const [streaming, setStreaming] = useState({}) // chapterId -> bool
    const [expandedId, setExpandedId] = useState(null)

    const title = data.useCustomTitle ? data.customTitle : data.selectedTitle

    const generatable = outline.filter(
        (ch) => !['cover', 'toc', 'references', 'appendix'].includes(ch.type)
    )

    const allDone = generatable.every((ch) => statuses[ch.id] === 'done' || statuses[ch.id] === 'edited')

    const handleGenerate = async (chapter, currentChapters, currentStatuses) => {
        const { id: chapterId, title: chapterName, subsections } = chapter

        // Daftar Pustaka: auto-fill from user's selected references, no AI needed
        if (chapterId === 'daftar_pustaka') {
            const refs = data.selectedRefs || []
            const activeChapters = currentChapters || chapters
            const activeStatuses = currentStatuses || statuses
            const refContent = refs.length > 0
                ? refs.map((r) => {
                    const authors = r.authors || 'Anonim'
                    const year = r.year || 't.t.'
                    const title = r.title || ''
                    const doi = r.doi ? ` https://doi.org/${r.doi}` : ''
                    return `${authors}. (${year}). ${title}.${doi}`
                }).join('\n\n')
                : '(Belum ada referensi yang dipilih)'
            const finalChapters = { ...activeChapters, [chapterId]: refContent }
            const finalStatuses = { ...activeStatuses, [chapterId]: 'done' }
            onChange({ chapters: finalChapters, chapterStatuses: finalStatuses })
            setExpandedId(chapterId)
            return { finalChapters, finalStatuses }
        }

        setStreaming((s) => ({ ...s, [chapterId]: true }))
        setExpandedId(chapterId)

        const activeChapters = currentChapters || chapters
        const activeStatuses = currentStatuses || statuses

        onChange({
            chapters: { ...activeChapters, [chapterId]: '' },
            chapterStatuses: { ...activeStatuses, [chapterId]: 'generating' },
        })

        let content = ''
        try {
            await generateChapterStream(
                {
                    title,
                    type: data.type,
                    chapterName,
                    subsections,
                    outline: outline.map((ch) => ch.title),
                    references: data.selectedRefs || [],
                    wordCount: (data.wordAllocation || {})[chapterId] || 500,
                    language: data.language,
                    audience: data.audience,
                },
                (token) => {
                    content += token
                    onChange({
                        chapters: { ...activeChapters, [chapterId]: content },
                        chapterStatuses: { ...activeStatuses, [chapterId]: 'generating' },
                    })
                }
            )

            const finalChapters = { ...activeChapters, [chapterId]: content }
            const finalStatuses = { ...activeStatuses, [chapterId]: 'done' }
            onChange({
                chapters: finalChapters,
                chapterStatuses: finalStatuses,
            })
            return { finalChapters, finalStatuses }
        } catch (e) {
            console.error('Chapter generate error:', e)
            const finalChapters = { ...activeChapters, [chapterId]: content || 'Gagal generate. Coba lagi.' }
            const finalStatuses = { ...activeStatuses, [chapterId]: content ? 'done' : 'pending' }
            onChange({
                chapters: finalChapters,
                chapterStatuses: finalStatuses,
            })
            return { finalChapters, finalStatuses }
        } finally {
            setStreaming((s) => ({ ...s, [chapterId]: false }))
        }
    }

    const handleGenerateAll = async () => {
        let currentChapters = { ...chapters }
        let currentStatuses = { ...statuses }

        for (const chapter of generatable) {
            if (statuses[chapter.id] === 'done' || statuses[chapter.id] === 'edited') continue
            const result = await handleGenerate(chapter, currentChapters, currentStatuses)
            if (result) {
                currentChapters = result.finalChapters
                currentStatuses = result.finalStatuses
            }
        }
    }

    const handleEdit = (chapterId, val) => {
        onChange({
            chapters: { ...chapters, [chapterId]: val },
            chapterStatuses: { ...statuses, [chapterId]: 'edited' },
        })
    }

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Generate Per Bab
            </h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
                Generate isi setiap bab satu per satu atau otomatis semua. Kamu bisa edit teks setelah di-generate.
            </p>

            <button
                className="btn-primary"
                onClick={handleGenerateAll}
                disabled={Object.values(streaming).some(v => v)}
                style={{ marginBottom: 24, width: '100%' }}
            >
                ⚡ Generate Semua Bab Otomatis
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {generatable.map((chapter) => {
                    const { id } = chapter
                    const status = statuses[id] || 'pending'
                    const isStreaming = streaming[id]
                    const content = chapters[id] || ''
                    const isExpanded = expandedId === id

                    return (
                        <div key={id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s',
                        }}>
                            {/* Header */}
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 16px', cursor: 'pointer',
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ color: isExpanded ? '#a5b4fc' : '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
                                        {chapter.title}
                                    </span>
                                    <span className={`badge ${STATUS_CLASS[status]}`}>
                                        {isStreaming ? '⚡ Generating...' : STATUS_LABELS[status] || status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn-primary"
                                        onClick={(e) => { e.stopPropagation(); handleGenerate(chapter) }}
                                        disabled={isStreaming}
                                        style={{ padding: '7px 16px', fontSize: 12 }}
                                    >
                                        {isStreaming ? <span className="loading-spinner" /> : status === 'pending' ? '⚡ Generate' : '🔄 Regenerate'}
                                    </button>
                                    <span style={{ color: '#374151', alignSelf: 'center' }}>
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Editor */}
                            {isExpanded && (
                                <div style={{ padding: '0 16px 16px' }}>
                                    <textarea
                                        className="input-field"
                                        value={content}
                                        onChange={(e) => handleEdit(id, e.target.value)}
                                        placeholder="Klik Generate untuk membuat isi bab ini..."
                                        style={{
                                            minHeight: 240, fontFamily: 'inherit', fontSize: 13,
                                            lineHeight: 1.8, resize: 'vertical',
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                        <span style={{ color: '#374151', fontSize: 12 }}>
                                            {content.split(/\s+/).filter(Boolean).length} kata
                                        </span>
                                        {content && (
                                            <span style={{ color: '#6366f1', fontSize: 12 }}>Tekan Ctrl+A untuk pilih semua</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151', fontSize: 13 }}>
                    {generatable.filter((ch) => statuses[ch.id] === 'done' || statuses[ch.id] === 'edited').length}/{generatable.length} bab selesai
                </span>
                <button className="btn-primary" onClick={onFinish} disabled={!allDone}>
                    Selesai ✓
                </button>
            </div>
        </div>
    )
}
