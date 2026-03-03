import { useState, useEffect } from 'react'

const WRITING_TYPES = [
    {
        id: "makalah",
        default_words: 4000,
        word_range: { min: 3000, max: 5000 },
        sections: [
            { id: "abstrak", percent: 10 },
            { id: "bab1", percent: 15 },
            { id: "bab2", percent: 60 },
            { id: "bab3", percent: 15 }
        ]
    },
    {
        id: "essay",
        default_words: 2250,
        word_range: { min: 1500, max: 3000 },
        sections: [
            { id: "pendahuluan", percent: 15 },
            { id: "argumen", percent: 70 }, // the ids from ai might be argumen_1, argumen_2
            { id: "kesimpulan", percent: 15 }
        ]
    },
    {
        id: "artikel_ilmiah",
        default_words: 7000,
        word_range: { min: 6000, max: 8000 },
        sections: [
            { id: "abstrak", percent: 4 },
            { id: "pendahuluan", percent: 12 },
            { id: "tinjauan_pustaka", percent: 18 },
            { id: "metodologi", percent: 8 },
            { id: "hasil_pembahasan", percent: 48 },
            { id: "kesimpulan", percent: 7 },
            { id: "daftar_pustaka", percent: 3 }
        ]
    },
    {
        id: "laporan_penelitian",
        default_words: 11500,
        word_range: { min: 8000, max: 15000 },
        sections: [
            { id: "abstrak", percent: 3 },
            { id: "bab1", percent: 10 },
            { id: "bab2", percent: 20 },
            { id: "bab3", percent: 12 },
            { id: "bab4", percent: 45 },
            { id: "bab5", percent: 7 },
            { id: "daftar_pustaka", percent: 3 }
        ]
    },
    {
        id: "proposal_skripsi",
        default_words: 6500,
        word_range: { min: 5000, max: 8000 },
        sections: [
            { id: "abstrak", percent: 4 },
            { id: "bab1", percent: 25 },
            { id: "bab2", percent: 40 },
            { id: "bab3", percent: 28 },
            { id: "daftar_pustaka", percent: 3 }
        ]
    },
    {
        id: "skripsi_kualitatif",
        default_words: 17500,
        word_range: { min: 15000, max: 20000 },
        sections: [
            { id: "abstrak", percent: 2 },
            { id: "bab1", percent: 10 },
            { id: "bab2", percent: 18 },
            { id: "bab3", percent: 10 },
            { id: "bab4", percent: 50 },
            { id: "bab5", percent: 7 },
            { id: "bab6", percent: 0 }, // fallback
            { id: "daftar_pustaka", percent: 3 }
        ]
    },
    {
        id: "skripsi_kuantitatif",
        default_words: 15000,
        word_range: { min: 12000, max: 18000 },
        sections: [
            { id: "abstrak", percent: 2 },
            { id: "bab1", percent: 10 },
            { id: "bab2", percent: 22 },
            { id: "bab3", percent: 15 },
            { id: "bab4", percent: 40 },
            { id: "bab5", percent: 8 },
            { id: "daftar_pustaka", percent: 3 }
        ]
    }
]

function distributeWords(outline, total, docType) {
    const chapters = outline.filter((ch) => !['cover', 'toc', 'references', 'appendix'].includes(ch.type))
    if (chapters.length === 0) return {}

    const typeConfig = WRITING_TYPES.find(t => t.id === docType)
    const alloc = {}
    let remaining = total
    let unallocatedChapters = []

    if (typeConfig) {
        chapters.forEach(ch => {
            // Find a matching section where chapter id starts with section id (e.g. argumen_1 starts with argumen)
            const sec = typeConfig.sections.find(s => ch.id.startsWith(s.id))
            if (sec && sec.percent > 0) {
                // For multiple chapters matching the same prefix (e.g., arguments), split evenly later
                // Let's modify approach: sum percents of found sections, and allocate based on relative weight
                unallocatedChapters.push({ ch, sec })
            } else {
                unallocatedChapters.push({ ch, sec: null })
            }
        })

        // Group by matched section and divide percentage equally
        const sectionGroups = {}
        unallocatedChapters.forEach(item => {
            if (item.sec) {
                if (!sectionGroups[item.sec.id]) sectionGroups[item.sec.id] = []
                sectionGroups[item.sec.id].push(item.ch)
            }
        })

        unallocatedChapters.forEach(item => {
            if (item.sec) {
                const groupSize = sectionGroups[item.sec.id].length
                const words = Math.floor((total * (item.sec.percent / 100)) / groupSize)
                alloc[item.ch.id] = words
                remaining -= words
            }
        })

        // Unallocated ones get leftover divided
        const leftoverChapters = unallocatedChapters.filter(i => !i.sec).map(i => i.ch)
        if (leftoverChapters.length > 0) {
            const perChapter = Math.floor(remaining / leftoverChapters.length)
            const rem = remaining - perChapter * leftoverChapters.length
            leftoverChapters.forEach((ch, i) => {
                alloc[ch.id] = perChapter + (i === 0 ? rem : 0)
                remaining -= alloc[ch.id]
            })
        }
    } else {
        const perChapter = Math.floor(total / chapters.length)
        const rem = total - perChapter * chapters.length
        chapters.forEach((ch, i) => {
            alloc[ch.id] = perChapter + (i === 0 ? rem : 0)
        })
        remaining = 0
    }

    if (remaining !== 0 && chapters.length > 0 && typeConfig) {
        alloc[chapters[0].id] += remaining
    }

    // Ensure at least 0
    chapters.forEach(ch => {
        if (alloc[ch.id] < 0) alloc[ch.id] = 0
    })

    return alloc
}

export default function Step5WordCount({ data, onChange, onNext }) {
    const outline = data.outline || []
    const typeConfig = WRITING_TYPES.find(t => t.id === data.type)

    const [total, setTotal] = useState(data.totalWords || (typeConfig ? typeConfig.default_words : 3000))
    const [alloc, setAlloc] = useState(data.wordAllocation || {})

    useEffect(() => {
        const generatableChapters = outline.filter((ch) => !['cover', 'toc', 'references', 'appendix'].includes(ch.type));

        let isValid = data.wordAllocation && Object.keys(data.wordAllocation).length > 0;

        if (isValid) {
            const currentKeys = generatableChapters.map(ch => ch.id);
            const savedKeys = Object.keys(data.wordAllocation);

            // Invalid if chapters changed
            if (currentKeys.length !== savedKeys.length || !currentKeys.every(k => savedKeys.includes(k))) {
                isValid = false;
            } else {
                // Check if it's the old even distribution (max diff <= 1)
                const vals = Object.values(data.wordAllocation);
                if (vals.length > 0) {
                    const max = Math.max(...vals);
                    const min = Math.min(...vals);
                    if (max - min <= 1) {
                        isValid = false; // Override old evenly split allocations
                    }
                }
            }
        }

        if (!isValid) {
            const newAlloc = distributeWords(outline, total, data.type)
            setAlloc(newAlloc)
            onChange({ totalWords: total, wordAllocation: newAlloc })
        }
        // eslint-disable-next-line
    }, [data.type])

    const generatableChapters = outline.filter(
        (ch) => !['cover', 'toc', 'references', 'appendix'].includes(ch.type)
    )

    const handleTotalChange = (val) => {
        const t = parseInt(val) || 0
        setTotal(t)
        const newAlloc = distributeWords(outline, t, data.type)
        setAlloc(newAlloc)
        onChange({ totalWords: t, wordAllocation: newAlloc })
    }

    const handleChapterChange = (id, val) => {
        const newVal = parseInt(val) || 0
        const oldVal = alloc[id] || 0
        const diff = newVal - oldVal

        // Distribute diff across the other chapters proportionally
        const others = generatableChapters.filter((ch) => ch.id !== id)
        if (others.length === 0) return

        const newAlloc = { ...alloc, [id]: newVal }
        const deductPer = Math.floor(diff / others.length)
        let remainder = diff - deductPer * others.length

        others.forEach((ch) => {
            newAlloc[ch.id] = Math.max(100, (alloc[ch.id] || 0) - deductPer - (remainder > 0 ? 1 : 0))
            if (remainder > 0) remainder--
        })

        const newTotal = Object.values(newAlloc).reduce((a, b) => a + b, 0)
        setAlloc(newAlloc)
        setTotal(newTotal)
        onChange({ totalWords: newTotal, wordAllocation: newAlloc })
    }

    const currentTotal = Object.values(alloc).reduce((a, b) => a + b, 0)

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Atur Alokasi Kata
            </h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>
                Tentukan total jumlah kata, lalu sesuaikan alokasi per bab jika diperlukan.
            </p>

            {/* Total input */}
            <div style={{ marginBottom: 28 }}>
                <label className="label">Total Jumlah Kata</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                        type="number"
                        className="input-field"
                        value={total}
                        onChange={(e) => handleTotalChange(e.target.value)}
                        min={typeConfig ? typeConfig.word_range.min : 500}
                        max={typeConfig ? typeConfig.word_range.max : 20000}
                        step={500}
                        style={{ maxWidth: 160 }}
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {typeConfig ? (
                            (() => {
                                const min = typeConfig.word_range.min;
                                const max = typeConfig.word_range.max;
                                const step = Math.floor((max - min) / 4);
                                // Generate 5 buttons spread out between min and max
                                return [min, min + step, min + step * 2, min + step * 3, max].map((n, i, arr) => {
                                    // Ensure the values are rounded nicely (e.g. to nearest 500 or 100)
                                    let rounded = Math.round(n / 100) * 100;
                                    // Make sure first is min and last is max exactly
                                    if (i === 0) rounded = min;
                                    if (i === arr.length - 1) rounded = max;

                                    // If we somehow get duplicate buttons, skip rendering the duplicate
                                    return (
                                        <button key={i} onClick={() => handleTotalChange(rounded)} style={{
                                            background: total === rounded ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${total === rounded ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                            color: total === rounded ? '#a5b4fc' : '#64748b',
                                            padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                        }}>{rounded.toLocaleString()}</button>
                                    )
                                })
                            })()
                        ) : (
                            [1500, 3000, 5000, 8000].map((n) => (
                                <button key={n} onClick={() => handleTotalChange(n)} style={{
                                    background: total === n ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${total === n ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                    color: total === n ? '#a5b4fc' : '#64748b',
                                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                }}>{n.toLocaleString()}</button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Per chapter */}
            {generatableChapters.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <label className="label" style={{ marginBottom: 0 }}>Alokasi Per Bab</label>
                        <span style={{
                            fontSize: 12, color: currentTotal === total ? '#10b981' : '#f59e0b',
                            fontWeight: 600,
                        }}>
                            Total: {currentTotal.toLocaleString()} / {total.toLocaleString()} kata
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {generatableChapters.map((ch) => {
                            const w = alloc[ch.id] || 0
                            const pct = total > 0 ? Math.round((w / total) * 100) : 0
                            return (
                                <div key={ch.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 10, padding: '12px 16px',
                                }}>
                                    <span style={{ flex: 1, fontSize: 13, color: '#e2e8f0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {ch.title}
                                    </span>
                                    {/* Bar */}
                                    <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, flexShrink: 0 }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 2, transition: 'width 0.3s' }} />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: 12, width: 32, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={w}
                                        onChange={(e) => handleChapterChange(ch.id, e.target.value)}
                                        min={100} step={50}
                                        style={{ width: 90, padding: '6px 10px', fontSize: 13, flexShrink: 0 }}
                                    />
                                    <span style={{ color: '#64748b', fontSize: 12, flexShrink: 0 }}>kata</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                <button className="btn-primary" onClick={() => { onChange({ totalWords: total, wordAllocation: alloc }); onNext() }}>
                    Lanjut →
                </button>
            </div>
        </div>
    )
}
