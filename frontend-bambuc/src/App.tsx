import { Routes, Route } from 'react-router-dom'
import { Home, Chat, Login, Register } from './pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
