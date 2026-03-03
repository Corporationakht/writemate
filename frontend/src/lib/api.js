// API helper — all requests go through Vite proxy to http://localhost:3001
const BASE = '/api'

export async function fetchTemplate(type) {
    const r = await fetch(`${BASE}/templates/${type}`)
    if (!r.ok) throw new Error('Gagal memuat template')
    return r.json()
}

export async function searchReferences(query, minYear) {
    const body = { query }
    if (minYear) body.minYear = minYear
    const r = await fetch(`${BASE}/references/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error('Gagal mencari referensi')
    return r.json()
}

export async function generateTitles(payload) {
    const r = await fetch(`${BASE}/generate/titles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Gagal generate judul')
    return r.json()
}

export async function generateOutline(payload) {
    const r = await fetch(`${BASE}/generate/outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Gagal generate kerangka')
    return r.json()
}

/**
 * Streaming chapter generation.
 * onToken(text) is called with each chunk.
 * Returns full text when done.
 */
export async function generateChapterStream(payload, onToken) {
    const r = await fetch(`${BASE}/generate/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Gagal generate bab')

    const reader = r.body.getReader()
    const decoder = new TextDecoder()
    let full = ''
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') return full
                try {
                    const parsed = JSON.parse(data)
                    if (parsed.token) {
                        full += parsed.token
                        onToken(parsed.token)
                    }
                } catch { }
            }
        }
    }
    return full
}

export async function exportDoc(payload) {
    const r = await fetch(`${BASE}/export/doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Gagal export DOC')
    return r.blob()
}

export async function exportPdf(payload) {
    const r = await fetch(`${BASE}/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!r.ok) throw new Error('Gagal export PDF')
    return r.blob()
}
