import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { verificarSessao } from '../services/authService'

export default function RotaProtegida({ children, permitirTrocaSenha = false }) {
  const [estado, setEstado] = useState('carregando')

  useEffect(() => {
    let ativo = true

    verificarSessao()
      .then(() => {
        if (ativo) setEstado('autenticado')
      })
      .catch((erro) => {
        if (!ativo) return
        if (erro.status === 403 && permitirTrocaSenha) {
          setEstado('autenticado')
          return
        }
        setEstado(erro.status === 403 ? 'trocar-senha' : 'nao-autenticado')
      })

    return () => {
      ativo = false
    }
  }, [permitirTrocaSenha])

  if (estado === 'carregando') {
    return <main className='rota-protegida-carregando' role='status'>Validando sessão...</main>
  }

  if (estado === 'nao-autenticado') return <Navigate to='/' replace />
  if (estado === 'trocar-senha') return <Navigate to='/trocar-senha' replace />

  return children
}
