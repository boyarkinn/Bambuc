import { Routes, Route } from 'react-router-dom'
import { Home, Chat, Images, Login, Register, Account } from './pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/images" element={<Images />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  )
}

export default App
