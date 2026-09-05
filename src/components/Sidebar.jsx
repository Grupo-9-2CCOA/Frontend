import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

const ITENS = [
  { id: 'dashboard', rota: '/dashboard', icone: 'dashboard', texto: 'Dashboard' },
  { id: 'pedidos', rota: '/pedidos', icone: 'shopping_bag', texto: 'Pedidos' },
  { id: 'calendario', rota: null, icone: 'calendar_month', texto: 'Calendário' },
  { id: 'clientes', rota: '/clientes', icone: 'group', texto: 'Clientes' },
  { id: 'configuracoes', rota: null, icone: 'settings_heart', texto: 'Configurações' },
]

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const [saindo, setSaindo] = useState(false)

  const handleLogout = async () => {
    if (saindo) return
    setSaindo(true)

    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      alert(error.message || 'Não foi possível sair.')
      setSaindo(false)
    }
  }

  return (
    <aside className='sidebar'>
      <div className='sidebar-brand'>
        <span className='material-symbols-outlined brand-icon' aria-hidden='true'>cake</span>
        <p className='sidebar-logo'>Doces com Amor</p>
      </div>

      <nav aria-label='Navegação principal'>
        {ITENS.map((item) => item.rota ? (
          <Link key={item.id} to={item.rota} className={active === item.id ? 'active' : undefined} aria-current={active === item.id ? 'page' : undefined}>
            <span className='material-symbols-outlined' aria-hidden='true'>{item.icone}</span>
            {item.texto}
          </Link>
        ) : (
          <span key={item.id} className='sidebar-item-disabled' aria-disabled='true'>
            <span className='material-symbols-outlined' aria-hidden='true'>{item.icone}</span>
            {item.texto}
          </span>
        ))}
      </nav>

      <button type='button' className='sidebar-logout' onClick={handleLogout} disabled={saindo}>
        <span className='material-symbols-outlined' aria-hidden='true'>logout</span>
        {saindo ? 'Saindo...' : 'Sair'}
      </button>
    </aside>
  )
}
