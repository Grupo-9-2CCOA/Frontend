import { useEffect, useRef, useState } from 'react'
import { listClientes, listEnderecosPorCliente } from '../services/clienteService'
import { criarPedido } from '../services/pedidoService'

import './NovoPedidoModal.css'

const PAGAMENTOS = [
  { id: 1, estado: 'Pendente' },
  { id: 2, estado: 'Pago' },
]

const ANDAMENTO_INICIAL = { id: 1, estado: 'Pendente' }

function formatarData(data) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function NovoPedidoModal({ dataSelecionada, onClose, onCreated }) {
  const [produto, setProduto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [horario, setHorario] = useState('')
  const [pagamentoId, setPagamentoId] = useState('1')
  const [clientes, setClientes] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [enderecos, setEnderecos] = useState([])
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null)
  const [carregandoClientes, setCarregandoClientes] = useState(true)
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const requisicaoEnderecos = useRef(0)

  useEffect(() => {
    let requisicaoAtiva = true

    listClientes()
      .then((dados) => {
        if (requisicaoAtiva) setClientes(dados)
      })
      .catch((error) => {
        if (requisicaoAtiva) setErro(error.message || 'Não foi possível carregar os clientes.')
      })
      .finally(() => {
        if (requisicaoAtiva) setCarregandoClientes(false)
      })

    return () => {
      requisicaoAtiva = false
    }
  }, [])

  const selecionarCliente = async (event) => {
    const clienteId = Number(event.target.value)
    const cliente = clientes.find((item) => item.id === clienteId) || null
    const requisicaoAtual = requisicaoEnderecos.current + 1
    requisicaoEnderecos.current = requisicaoAtual

    setClienteSelecionado(cliente)
    setEnderecoSelecionado(null)
    setEnderecos([])
    setErro('')

    if (!cliente) return

    setCarregandoEnderecos(true)
    try {
      const dados = await listEnderecosPorCliente(cliente.id)
      if (requisicaoAtual !== requisicaoEnderecos.current) return
      setEnderecos(dados)
    } catch (error) {
      if (requisicaoAtual !== requisicaoEnderecos.current) return
      setErro(error.message || 'Não foi possível carregar os endereços do cliente.')
    } finally {
      if (requisicaoAtual === requisicaoEnderecos.current) setCarregandoEnderecos(false)
    }
  }

  const selecionarEndereco = (event) => {
    const enderecoId = Number(event.target.value)
    const endereco = enderecos.find((item) => item.id === enderecoId) || null
    setEnderecoSelecionado(endereco)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (salvando) return

    if (!produto.trim() || !descricao.trim() || !valor || !horario || !clienteSelecionado || !enderecoSelecionado) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    const dataPedido = `${dataSelecionada}T${horario}:00`
    if (new Date(dataPedido) <= new Date()) {
      setErro('A data e o horário de entrega devem estar no futuro.')
      return
    }

    const pagamento = PAGAMENTOS.find((item) => item.id === Number(pagamentoId))

    setErro('')
    setSalvando(true)

    try {
      const pedidoCriado = await criarPedido({
        produto: produto.trim(),
        descricao: descricao.trim(),
        valor: Number(valor),
        isAtivo: true,
        isReagendado: false,
        dataPedido,
        entrega: ANDAMENTO_INICIAL,
        pagamento,
        cliente: clienteSelecionado,
        endereco: enderecoSelecionado,
      })

      onCreated(pedidoCriado)
      onClose()
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className='pedido-modal-overlay'>
      <div className='pedido-modal' role='dialog' aria-modal='true' aria-labelledby='novo-pedido-titulo'>
        <header className='pedido-modal-cabecalho'>
          <div>
            <h2 id='novo-pedido-titulo'>Novo pedido</h2>
            <p>Entrega em {formatarData(dataSelecionada)}</p>
          </div>
          <button type='button' onClick={onClose} disabled={salvando} aria-label='Fechar cadastro de pedido'>×</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className='pedido-modal-grade'>
            <label>
              Produto*
              <input value={produto} onChange={(event) => setProduto(event.target.value)} maxLength='100' required />
            </label>

            <label>
              Cliente*
              <select value={clienteSelecionado?.id || ''} onChange={selecionarCliente} disabled={carregandoClientes} required>
                <option value=''>{carregandoClientes ? 'Carregando clientes...' : 'Selecione um cliente'}</option>
                {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
              </select>
            </label>

            <label>
              Valor*
              <input type='number' value={valor} onChange={(event) => setValor(event.target.value)} min='0.01' step='0.01' placeholder='0,00' required />
            </label>

            <label>
              Endereço*
              <select
                value={enderecoSelecionado?.id || ''}
                onChange={selecionarEndereco}
                disabled={!clienteSelecionado || carregandoEnderecos}
                required
              >
                <option value=''>
                  {carregandoEnderecos ? 'Carregando endereços...' : 'Selecione um endereço'}
                </option>
                {enderecos.map((endereco) => (
                  <option key={endereco.id} value={endereco.id}>
                    {endereco.logradouro}, {endereco.numero}
                  </option>
                ))}
              </select>
              {clienteSelecionado && !carregandoEnderecos && enderecos.length === 0 && (
                <small>Este cliente não possui endereço cadastrado.</small>
              )}
            </label>

            <label>
              Pagamento*
              <select value={pagamentoId} onChange={(event) => setPagamentoId(event.target.value)} required>
                {PAGAMENTOS.map((pagamento) => (
                  <option key={pagamento.id} value={pagamento.id}>{pagamento.estado}</option>
                ))}
              </select>
            </label>

            <label>
              Complemento
              <input value={enderecoSelecionado?.complemento || ''} readOnly placeholder='Sem complemento' />
            </label>

            <label>
              Data de entrega
              <input value={formatarData(dataSelecionada)} readOnly />
            </label>

            <label>
              Horário de entrega*
              <input type='time' value={horario} onChange={(event) => setHorario(event.target.value)} required />
            </label>

            <label>
              Andamento inicial
              <input value={ANDAMENTO_INICIAL.estado} readOnly />
            </label>

            <label className='pedido-modal-descricao'>
              Descrição*
              <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} maxLength='200' required />
            </label>
          </div>

          {erro && <p className='pedido-modal-erro' role='alert'>{erro}</p>}

          <footer className='pedido-modal-acoes'>
            <button type='button' className='pedido-modal-cancelar' onClick={onClose} disabled={salvando}>Cancelar</button>
            <button type='submit' className='pedido-modal-salvar' disabled={salvando || carregandoClientes}>
              {salvando ? 'Salvando...' : 'Salvar pedido'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default NovoPedidoModal
