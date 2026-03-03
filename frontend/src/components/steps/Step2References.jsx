import { useState } from 'react'
import { searchReferences } from '../../lib/api'

export default function Step2References({ data, onChange, onNext }) {
    const [query, setQuery] = useState(data.topic || '')
    const [results, setResults] = useState(data.searchResults || [])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Default to last 4 years
    const currentYear = new Date().getFullYear();
    const [minYear, setMinYear] = useState(data.minYear || (currentYear - 4));

    const selected = data.selectedRefs || []

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)
        setError('')
        try {
            const { results: refs } = await searchReferences(query, minYear)
            setResults(refs)
            onChange({ topic: query, searchResults: refs, minYear })
        } catch (e) {
            console.error(e)
            setError('Gagal mencari referensi. Pastikan koneksi internet stabil.')
        } finally {
            setLoading(false)
        }
    }

    const toggleRef = (ref) => {
        const key = ref.doi || ref.title
        const exists = selected.find((r) => (r.doi || r.title) === key)
        const newSelected = exists
            ? selected.filter((r) => (r.doi || r.title) !== key)
            : [...selected, ref]
        onChange({ selectedRefs: newSelected })
    }

    const isSelected = (ref) => {
        const key = ref.doi || ref.title
        return !!selected.find((r) => (r.doi || r.title) === key)
    }

    // Generate year options
    const yearOptions = [
        { label: 'Semua Tahun', value: 0 },
        { label: `3 Tahun Terakhir (≥ ${currentYear - 3})`, value: currentYear - 3 },
        { label: `4 Tahun Terakhir (≥ ${currentYear - 4})`, value: currentYear - 4 },
        { label: `5 Tahun Terakhir (≥ ${currentYear - 5})`, value: currentYear - 5 },
        { label: `10 Tahun Terakhir (≥ ${currentYear - 10})`, value: currentYear - 10 },
    ];

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Input Topik & Cari Referensi
            </h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>
                Masukkan topik atau kata kunci, lalu cari referensi ilmiah dari OpenAlex & Crossref.
            </p>

            {/* Search */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <input
                    className="input-field"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onChange({ topic: e.target.value }) }}
                    placeholder="Contoh: machine learning, pendidikan karakter, fintech..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <select
                    className="input-field"
                    value={minYear}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMinYear(val);
                        onChange({ minYear: val });
                    }}
                    style={{ width: 'auto', backgroundColor: '#1e293b' }}
                >
                    {yearOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <button className="btn-primary" onClick={handleSearch} disabled={loading || !query.trim()} style={{ whiteSpace: 'nowrap' }}>
                    {loading ? <span className="loading-spinner" /> : '🔍 Cari'}
                </button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            {/* Selected count */}
            {selected.length > 0 && (
                <div style={{
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: 13, color: '#10b981',
                }}>
                    ✓ {selected.length} referensi dipilih
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', marginBottom: 24, paddingRight: 4 }}>
                    {results.map((ref, i) => {
                        const sel = isSelected(ref)
                        return (
                            <div
                                key={i}
                                onClick={() => toggleRef(ref)}
                                style={{
                                    background: sel ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${sel ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                                    transition: 'all 0.2s', position: 'relative',
                                }}
                                onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' }}
                                onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                            >
                                {sel && (
                                    <div style={{
                                        position: 'absolute', top: 12, right: 14,
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, color: 'white', fontWeight: 700,
                                    }}>✓</div>
                                )}
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 6, paddingRight: sel ? 28 : 0, lineHeight: 1.5 }}>
                                    {ref.title}
                                </div>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
                                    <span>👤 {ref.authors}</span>
                                    <span>📅 {ref.year}</span>
                                    {ref.doi && <span>DOI: {ref.doi}</span>}
                                    <span style={{
                                        background: ref.source === 'OpenAlex' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)',
                                        color: ref.source === 'OpenAlex' ? '#a5b4fc' : '#67e8f9',
                                        padding: '2px 8px', borderRadius: 99, fontSize: 11,
                                    }}>{ref.source}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {results.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#374151', fontSize: 13 }}>
                    Masukkan kata kunci dan klik "Cari" untuk menemukan referensi ilmiah.
                    <br /><span style={{ fontSize: 12, color: '#1f2937' }}>Referensi bersifat opsional.</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ color: '#374151', fontSize: 13, alignSelf: 'center' }}>
                    Referensi bersifat opsional
                </span>
                <button className="btn-primary" onClick={onNext} disabled={!query.trim()}>
                    Lanjut →
                </button>
            </div>
        </div>
    )
}
