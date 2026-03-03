import { Link } from 'react-router-dom'

const features = [
    {
        icon: '🤖',
        title: 'Generator AI',
        desc: 'Powered by model bahasa terbaru. Hasilkan konten akademis berkualitas tinggi dalam hitungan detik.',
        color: '#6366f1',
    },
    {
        icon: '📚',
        title: 'Referensi Valid',
        desc: 'Cari referensi ilmiah real dari OpenAlex & Crossref. DOI dan penulis terverifikasi.',
        color: '#8b5cf6',
    },
    {
        icon: '📄',
        title: 'Export Instan',
        desc: 'Download langsung sebagai Word (.docx) atau PDF siap cetak dengan format akademis.',
        color: '#06b6d4',
    },
]

const stats = [
    { value: '5', label: 'Jenis Karya Tulis' },
    { value: '2+', label: 'Sumber Referensi' },
    { value: '100%', label: 'Gratis' },
    { value: '7', label: 'Langkah Mudah' },
]

const types = ['Makalah', 'Essay', 'Artikel Ilmiah', 'Laporan Penelitian', 'Proposal Skripsi']

export default function Landing() {
    return (
        <div style={{ paddingTop: 64 }}>
            {/* Hero Section */}
            <section style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '60px 24px',
                background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Background orbs */}
                <div style={{
                    position: 'absolute', top: '20%', left: '15%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.06)',
                    filter: 'blur(80px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', right: '15%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'rgba(139,92,246,0.06)',
                    filter: 'blur(80px)', pointerEvents: 'none',
                }} />

                <div className="fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#a5b4fc',
                        padding: '6px 16px',
                        borderRadius: 99, fontSize: 12, fontWeight: 600,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        marginBottom: 24,
                    }}>✨ AI Academic Writing Generator</div>

                    <h1 style={{
                        fontSize: 'clamp(40px, 7vw, 72px)',
                        fontWeight: 900, lineHeight: 1.1,
                        marginBottom: 20, color: 'white',
                    }}>
                        Buat Karya Tulis{' '}
                        <span className="gradient-text">Ilmiah</span>
                        <br />dalam Hitungan Menit
                    </h1>

                    <p style={{
                        fontSize: 18, color: '#94a3b8',
                        maxWidth: 560, margin: '0 auto 36px',
                        lineHeight: 1.7,
                    }}>
                        WriteMate membantu mahasiswa Indonesia membuat makalah, essay, artikel ilmiah,
                        laporan penelitian, dan proposal skripsi berkualitas tinggi dengan bantuan AI.
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/generate" style={{ textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                                Mulai Sekarang →
                            </button>
                        </Link>
                        <Link to="/history" style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
                                Lihat Riwayat
                            </button>
                        </Link>
                    </div>

                    {/* Supported types */}
                    <div style={{ marginTop: 36, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {types.map((t) => (
                            <span key={t} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#64748b', padding: '4px 12px',
                                borderRadius: 99, fontSize: 12,
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{
                padding: '60px 24px',
                background: 'rgba(99,102,241,0.04)',
                borderTop: '1px solid rgba(99,102,241,0.1)',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
            }}>
                <div style={{
                    maxWidth: 800, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
                }}>
                    {stats.map(({ value, label }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div className="gradient-text" style={{ fontSize: 40, fontWeight: 900 }}>{value}</div>
                            <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>
                        Kenapa Pilih <span className="gradient-text">WriteMate</span>?
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 16 }}>
                        Semua yang kamu butuhkan untuk menulis karya ilmiah ada di satu tempat
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {features.map((f) => (
                        <div key={f.title} className="card-gradient-border" style={{
                            transition: 'transform 0.2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: `linear-gradient(135deg, ${f.color}20, ${f.color}10)`,
                                border: `1px solid ${f.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 26, marginBottom: 20,
                            }}>{f.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10 }}>{f.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 14 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Steps preview */}
            <section style={{
                padding: '80px 24px',
                background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            }}>
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>
                        Hanya 7 Langkah Mudah
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: 48 }}>
                        Dari konfigurasi sampai download — semuanya dipandu step by step
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                        {['Pilih jenis karya & gaya bahasa', 'Cari referensi ilmiah valid', 'Generate & pilih judul terbaik',
                            'Buat kerangka otomatis', 'Atur alokasi kata per bab', 'Generate isi setiap bab', 'Preview & download dokumen'].map((s, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 16, alignItems: 'center',
                                    background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
                                    borderRadius: 12, padding: '14px 20px',
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                                    }}>{i + 1}</div>
                                    <span style={{ color: '#cbd5e1', fontSize: 14 }}>{s}</span>
                                </div>
                            ))}
                    </div>

                    <div style={{ marginTop: 36 }}>
                        <Link to="/generate" style={{ textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>
                                Coba Sekarang — Gratis! 🚀
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(99,102,241,0.1)',
                padding: '28px 24px',
                textAlign: 'center',
                color: '#374151', fontSize: 13,
            }}>
                © 2026 WriteMate — AI Academic Writing Generator untuk Mahasiswa Indonesia
            </footer>
        </div>
    )
}
