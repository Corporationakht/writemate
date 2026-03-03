const STEPS = [
    'Konfigurasi', 'Referensi', 'Judul', 'Kerangka', 'Alokasi Kata', 'Generate Bab', 'Preview',
]

export default function ProgressBar({ currentStep }) {
    return (
        <div style={{ padding: '0 0 32px 0' }}>
            {/* Step numbers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                {STEPS.map((label, i) => {
                    const step = i + 1
                    const isActive = step === currentStep
                    const isDone = step < currentStep

                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Connector */}
                            {i > 0 && (
                                <div style={{
                                    width: 40, height: 2,
                                    background: isDone ? '#6366f1' : 'rgba(99,102,241,0.2)',
                                    transition: 'background 0.3s',
                                }} />
                            )}
                            {/* Step circle + label */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700,
                                    background: isDone
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : isActive
                                            ? 'rgba(99,102,241,0.15)'
                                            : 'rgba(255,255,255,0.03)',
                                    border: isActive
                                        ? '2px solid #6366f1'
                                        : isDone
                                            ? '2px solid transparent'
                                            : '2px solid rgba(99,102,241,0.2)',
                                    color: isDone ? 'white' : isActive ? '#a5b4fc' : '#4b5563',
                                    transition: 'all 0.3s',
                                    boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                                }}>
                                    {isDone ? '✓' : step}
                                </div>
                                <span style={{
                                    fontSize: 11, fontWeight: 500,
                                    color: isActive ? '#a5b4fc' : isDone ? '#6366f1' : '#4b5563',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {label}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
