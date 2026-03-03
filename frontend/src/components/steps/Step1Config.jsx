const TYPES = [
    { value: 'makalah', label: 'Makalah' },
    { value: 'essay', label: 'Essay' },
    { value: 'artikel_ilmiah', label: 'Artikel Ilmiah' },
    { value: 'laporan_penelitian', label: 'Laporan Penelitian' },
    { value: 'proposal_skripsi', label: 'Proposal Skripsi' },
    { value: 'skripsi_kualitatif', label: 'Skripsi (Kualitatif)' },
    { value: 'skripsi_kuantitatif', label: 'Skripsi (Kuantitatif)' },
]

export default function Step1Config({ data, onChange, onNext }) {
    const canProceed = data.prodi && data.type && data.language && data.audience

    const row = (label, key, options) => (
        <div style={{ marginBottom: 20 }}>
            <label className="label">{label}</label>
            <select
                className="input-field"
                value={data[key] || ''}
                onChange={(e) => onChange({ [key]: e.target.value })}
            >
                <option value="">— Pilih —</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    )

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Konfigurasi Awal
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>
                Tentukan jenis karya tulis, gaya bahasa, dan target pembaca.
            </p>

            {row('Program Studi', 'prodi', [
                { value: 'Pendidikan Agama Islam (PAI)', label: 'Pendidikan Agama Islam (PAI)' },
                { value: 'Manajemen Pendidikan Islam (MPI)', label: 'Manajemen Pendidikan Islam (MPI)' },
                { value: 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)', label: 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)' },
                { value: 'Ekonomi Syariah (ES)', label: 'Ekonomi Syariah (ES)' },
            ])}

            {row('Jenis Karya Tulis', 'type', TYPES)}
            {row('Gaya Bahasa', 'language', [
                { value: 'formal', label: 'Formal (Akademis)' },
                { value: 'semi-formal', label: 'Semi-formal' },
            ])}
            {row('Target Pembaca', 'audience', [
                { value: 'sma', label: 'SMA / Sederajat' },
                { value: 's1', label: 'Mahasiswa S1' },
                { value: 's2', label: 'Mahasiswa S2 / Pascasarjana' },
            ])}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn-primary" onClick={onNext} disabled={!canProceed}>
                    Lanjut →
                </button>
            </div>
        </div>
    )
}
