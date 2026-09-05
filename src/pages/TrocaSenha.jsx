import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DefaultButton } from '../assets/components/DefaultButton'
import { trocarSenha } from '../services/authService'

import '../App.css'

function TrocaSenha() {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (carregando) return

    if (senha.length < 6 || senha.length > 20) {
      setErro('A senha deve ter entre 6 e 20 caracteres.')
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      await trocarSenha(senha)
      navigate('/pedidos')
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className='main'>
      <div className='form'>
        <div className='brand'>
          <span className='material-symbols-outlined'>cake</span>
          <p className='title'>Doces com Amor</p>
        </div>

        <div className='form-content'>
          <p className='welcome-text'>Crie sua nova senha</p>
          <p className='description-text'>Escolha uma senha para acessar sua conta</p>

          <form className='form-padding' onSubmit={handleSubmit} aria-busy={carregando}>
            <div className='form-field-component'>
              <label className='form-field' htmlFor='nova-senha'>Nova senha</label>
              <input
                id='nova-senha'
                type='password'
                placeholder='••••••••'
                className='input'
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete='new-password'
                minLength='6'
                maxLength='20'
                required
              />
            </div>

            <p className='password-hint'>Use entre 6 e 20 caracteres.</p>

            <div className='form-field-component'>
              <label className='form-field' htmlFor='confirmacao-senha'>Confirmar nova senha</label>
              <input
                id='confirmacao-senha'
                type='password'
                placeholder='••••••••'
                className='input'
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                autoComplete='new-password'
                minLength='6'
                maxLength='20'
                required
              />
            </div>

            {erro && <p className='login-error' role='alert'>{erro}</p>}

            <DefaultButton loading={carregando} disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar nova senha'}
            </DefaultButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TrocaSenha
