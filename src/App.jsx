import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import TrocaSenha from './pages/TrocaSenha'
import NovoPedido from './pages/NovoPedido'
import ClientesList from './pages/ClientesList'
import PedidosList from './pages/PedidosList'
import Dashboard from './pages/Dashboard'
import RotaProtegida from './components/RotaProtegida'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/trocar-senha" element={<RotaProtegida permitirTrocaSenha><TrocaSenha /></RotaProtegida>} />
        <Route path="/novo-pedido" element={<RotaProtegida><NovoPedido /></RotaProtegida>} />
        <Route path="/clientes" element={<RotaProtegida><ClientesList /></RotaProtegida>} />
        <Route path="/pedidos" element={<RotaProtegida><PedidosList /></RotaProtegida>} />
        <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
