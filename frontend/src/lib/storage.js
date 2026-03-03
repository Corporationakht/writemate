const KEY = 'writemate_history'

export function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
        return []
    }
}

export function saveToHistory(item) {
    const history = getHistory()
    const entry = {
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        ...item,
    }
    history.unshift(entry)
    // keep last 50
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, 50)))
    return entry
}

export function deleteFromHistory(id) {
    const history = getHistory().filter((h) => h.id !== id)
    localStorage.setItem(KEY, JSON.stringify(history))
}

export function getHistoryItem(id) {
    return getHistory().find((h) => h.id === id) || null
}
