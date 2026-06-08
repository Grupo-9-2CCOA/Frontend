import { DefaultButton } from '../assets/components/DefaultButton'

function NovoPedido() {
    return (
        <div className='page-layout'>
            <aside className='sidebar'>
                <p className='sidebar-logo'>Doces Com Amor</p>
                <div className='sidebar-user'>
                    <div className='avatar' />
                    <p>Karla Muniz</p>
                </div>
                <nav>
                    <a href='#' className='sidebar-icon-text'><span className="material-symbols-outlined">
                        dashboard
                    </span> Dashboard</a>
                    <a href='#' className='sidebar-icon-text'><span className="material-symbols-outlined">
                        shopping_bag
                    </span>Pedidos</a>
                    <a href='#' className='sidebar-icon-text'><span className="material-symbols-outlined">
                        calendar_month
                    </span>Calendário</a>
                    <a href='#' className='sidebar-icon-text'><span className="material-symbols-outlined">
                        group
                    </span>Clientes</a>
                    <a href='#' className='sidebar-icon-text'><span className="material-symbols-outlined">
                        settings_heart
                    </span>Configurações</a>
                </nav>
            </aside>

            <main className='page-main'>
                <h2 className='page-title'>Novo Pedido +</h2>

                <section className='form-section'>
                    <h3 className='assignment-text'><span className="material-symbols-outlined">
                        cake_add
                    </span> Identificação do Pedido</h3>
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
                    <h3 className='assignment-text'><span class="material-symbols-outlined">
                        person_add
                    </span> Informações do Cliente</h3>
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