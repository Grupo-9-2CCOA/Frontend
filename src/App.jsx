import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import NovoPedido from './pages/NovoPedido'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/novo-pedido" element={<NovoPedido />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App