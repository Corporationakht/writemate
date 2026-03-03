import { useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import Step1Config from '../components/steps/Step1Config'
import Step2References from '../components/steps/Step2References'
import Step3Titles from '../components/steps/Step3Titles'
import Step4Outline from '../components/steps/Step4Outline'
import Step5WordCount from '../components/steps/Step5WordCount'
import Step6Chapters from '../components/steps/Step6Chapters'
import Step7Preview from '../components/steps/Step7Preview'

const TOTAL_STEPS = 7

export default function Generator() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState({
        // Step 1
        type: '',
        language: 'formal',
        audience: 's1',
        // Step 2
        topic: '',
        searchResults: [],
        selectedRefs: [],
        // Step 3
        generatedTitles: [],
        selectedTitle: '',
        customTitle: '',
        useCustomTitle: false,
        // Step 4
        outline: [],
        // Step 5
        totalWords: 3000,
        wordAllocation: {},
        // Step 6
        chapters: {},
        chapterStatuses: {},
    })

    const update = (partial) => setData((prev) => ({ ...prev, ...partial }))

    const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))

    const goToStep = (s) => {
        if (s < step) setStep(s)
    }

    const steps = [
        <Step1Config data={data} onChange={update} onNext={next} />,
        <Step2References data={data} onChange={update} onNext={next} />,
        <Step3Titles data={data} onChange={update} onNext={next} />,
        <Step4Outline data={data} onChange={update} onNext={next} />,
        <Step5WordCount data={data} onChange={update} onNext={next} />,
        <Step6Chapters data={data} onChange={update} onFinish={next} />,
        <Step7Preview data={data} />,
    ]

    return (
        <div className="flex flex-col w-full" style={{ paddingTop: 64, minHeight: '100vh' }}>
            {/* Header band */}
            <div className="w-full" style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
                padding: '32px 24px 0',
            }}>
                <div className="w-full">
                    <div style={{ marginBottom: 24, textAlign: 'center' }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>
                            Generator <span className="gradient-text">Karya Tulis</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                            Ikuti 7 langkah berikut untuk membuat karya tulis ilmiah berkualitas
                        </p>
                    </div>
                    <ProgressBar currentStep={step} />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 w-full overflow-auto" style={{ padding: '32px 24px' }}>
                {/* Breadcrumb navigation */}
                {step > 1 && (
                    <button
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        className="btn-secondary"
                        style={{ marginBottom: 20, padding: '7px 16px', fontSize: 13 }}
                    >
                        ← Kembali
                    </button>
                )}

                {/* Step card */}
                <div className="card-gradient-border" style={{ padding: '32px' }}>
                    {steps[step - 1]}
                </div>

                {/* Step nav dots (clickable for backward navigation) */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => goToStep(i + 1)}
                            title={`Langkah ${i + 1}`}
                            style={{
                                width: i + 1 === step ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i + 1 === step
                                    ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                    : i + 1 < step
                                        ? '#4f46e5'
                                        : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                cursor: i + 1 < step ? 'pointer' : 'default',
                                transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
