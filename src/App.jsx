import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import TrocaSenha from './pages/TrocaSenha'
import NovoPedido from './pages/NovoPedido'
import ClientesList from './pages/ClientesList'
import ClienteDetail from './pages/ClienteDetail'
import PedidosList from './pages/PedidosList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/trocar-senha" element={<TrocaSenha />} />
        <Route path="/novo-pedido" element={<NovoPedido />} />
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/clientes/:id" element={<ClienteDetail />} />
        <Route path="/pedidos" element={<PedidosList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
