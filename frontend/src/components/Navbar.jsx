import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
    const { pathname } = useLocation()

    const links = [
        { to: '/', label: 'Beranda' },
        { to: '/generate', label: 'Generator' },
        { to: '/history', label: 'Riwayat' },
    ]

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            background: 'rgba(10,10,26,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: '0 32px',
            height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: 'white',
                }}>W</div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
                    Write<span style={{ color: '#8b5cf6' }}>Mate</span>
                </span>
            </Link>

            <div style={{ display: 'flex', gap: 8 }}>
                {links.map(({ to, label }) => (
                    <Link key={to} to={to} style={{
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        color: pathname === to ? '#a5b4fc' : '#94a3b8',
                        background: pathname === to ? 'rgba(99,102,241,0.12)' : 'transparent',
                        transition: 'all 0.2s',
                    }}>{label}</Link>
                ))}
            </div>

            <Link to="/generate" style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                padding: '9px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
            }}>Mulai Nulis ✍️</Link>
        </nav>
    )
}
