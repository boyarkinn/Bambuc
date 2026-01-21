import { Routes, Route } from 'react-router-dom'
import { Home, Chat } from './pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default App
