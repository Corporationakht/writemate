import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Generator from './pages/Generator'
import History from './pages/History'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  )
}
