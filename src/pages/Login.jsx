import { useState } from 'react'
import { DefaultButton } from '../assets/components/DefaultButton'
import Checkbox from '../assets/components/Checkbox'
import { login } from '../services/authService'

import '../App.css'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [lembrarAcesso, setLembrarAcesso] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (carregando) return

    setErro('')
    setCarregando(true)

    try {
      const sessao = await login(usuario.trim(), senha)
      navigate(sessao.trocaSenhaObrigatoria ? '/trocar-senha' : '/pedidos')
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
          <span className="material-symbols-outlined">
            cake
          </span>
          <p className='title'>Doces com Amor</p>
        </div>

        <div className='form-content'>
          <p className='welcome-text'>Boas-Vindas</p>
          <p className='description-text'>Acesse sua conta para gerenciar a confeitaria</p>

          <form className='form-padding' onSubmit={handleSubmit}>
            <div className='form-field-component'>
              <label className='form-field' htmlFor='usuario'>Usuário</label>
              <input
                id='usuario'
                type='text'
                placeholder='exemplo'
                className='input'
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                autoComplete='username'
                required
              />
            </div>

            <div className='form-field-component'>
              <label className='form-field' htmlFor='senha'>Senha</label>
              <input
                id='senha'
                type='password'
                placeholder='••••••••'
                className='input'
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete='current-password'
                required
              />
            </div>

            {erro && <p className='login-error' role='alert'>{erro}</p>}

            <div className='remember-row'>
              <Checkbox
                checked={lembrarAcesso}
                onChange={() => setLembrarAcesso(prev => !prev)}
              >
                Lembrar acesso
              </Checkbox>
              <a href='#' className='forgot-link'>Esqueceu a senha?</a>
            </div>

            <DefaultButton>
                {carregando ? 'ENTRANDO...' : 'ENTRAR'}
            </DefaultButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
