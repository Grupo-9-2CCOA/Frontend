import { useState } from 'react'
import { DefaultButton } from './assets/components/DefaultButton'
import Checkbox from './assets/components/Checkbox'

import './App.css'

function App() {
  const [lembrarAcesso, setLembrarAcesso] = useState(false)

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

          <div className='form-padding'>
            <div className='form-field-component'>
              <p className='form-field'>Usuário</p>
              <input type="text" placeholder='exemplo' className='input' />
            </div>

            <div className='form-field-component'>
              <p className='form-field'>Senha</p>
              <input type="password" placeholder='••••••••' className='input' />
            </div>

            <div className='remember-row'>
              <Checkbox
                checked={lembrarAcesso}
                onChange={() => setLembrarAcesso(prev => !prev)}
              >
                Lembrar acesso
              </Checkbox>
              <a href='#' className='forgot-link'>Esqueceu a senha?</a>
            </div>

            <DefaultButton>ENTRAR</DefaultButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App