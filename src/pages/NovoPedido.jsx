import { DefaultButton } from '../assets/components/DefaultButton'

function NovoPedido() {
  return (
    <div className='page-layout'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <p className='sidebar-logo'>Doces Com Amor</p>
        <div className='sidebar-user'>
          <div className='avatar' />
          <p>Karla Muniz</p>
        </div>
        <nav>
          <a href='#'>Dashboard</a>
          <a href='#'>Pedidos</a>
          <a href='#'>Calendário</a>
          <a href='#'>Clientes</a>
          <a href='#'>Configurações</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className='page-main'>
        <h2 className='page-title'>Novo Pedido +</h2>

        <section className='form-section'>
          <h3>📋 Identificação do Pedido</h3>
          <div className='form-grid'>
            <div className='form-field-component'>
              <p className='form-field'>Produto</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>Valor</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>Pagamento</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>Entrega</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component full-width'>
              <p className='form-field'>Descrição</p>
              <textarea className='input textarea' />
            </div>
          </div>
        </section>

        <section className='form-section'>
          <h3>📋 Informações do Cliente</h3>
          <div className='form-grid'>
            <div className='form-field-component'>
              <p className='form-field'>Nome</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>Celular</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>CPF</p>
              <input className='input' type='text' />
            </div>
            <div className='form-field-component'>
              <p className='form-field'>Selecionar Endereço</p>
              <input className='input' type='text' />
            </div>
          </div>
        </section>

        <div className='form-actions'>
          <button className='btn-cancelar'>Cancelar</button>
          <DefaultButton>Salvar Pedido</DefaultButton>
        </div>
      </main>
    </div>
  )
}

export default NovoPedido