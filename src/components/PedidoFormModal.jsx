import { useEffect, useRef, useState } from 'react'
import { listClientes, listEnderecosPorCliente } from '../services/clienteService'
import { atualizarPedido, criarPedido } from '../services/pedidoService'
import { ENTREGA_INICIAL, STATUS_PAGAMENTO } from '../constants/statusPedido'

import './NovoPedidoModal.css'

function formatarData(data) {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarDataApi(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function PedidoFormModal({ dataSelecionada, pedido = null, onClose, onSaved }) {
  const editando = Boolean(pedido)
  const dataInicial = pedido?.dataPedido?.slice(0, 10) || dataSelecionada
  const [produto, setProduto] = useState(pedido?.produto || '')
  const [descricao, setDescricao] = useState(pedido?.descricao || '')
  const [valor, setValor] = useState(pedido?.valor ? String(pedido.valor) : '')
  const [dataEntrega, setDataEntrega] = useState(dataInicial)
  const [horario, setHorario] = useState(pedido?.dataPedido?.slice(11, 16) || '')
  const [pagamentoId, setPagamentoId] = useState(String(pedido?.pagamento?.id || 1))
  const [clientes, setClientes] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(pedido?.cliente || null)
  const [enderecos, setEnderecos] = useState([])
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(pedido?.endereco || null)
  const [carregandoClientes, setCarregandoClientes] = useState(true)
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(Boolean(pedido?.cliente?.id))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const requisicaoEnderecos = useRef(0)
  const modalRef = useRef(null)
  const hoje = formatarDataApi(new Date())

  useEffect(() => {
    const elementoAnterior = document.activeElement
    const modal = modalRef.current
    modal?.querySelector('input:not([readonly]), select, textarea')?.focus()

    return () => elementoAnterior?.focus()
  }, [])

  useEffect(() => {
    const modal = modalRef.current

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !salvando) {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const controles = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')]
      const primeiroControle = controles[0]
      const ultimoControle = controles[controles.length - 1]

      if (event.shiftKey && document.activeElement === primeiroControle) {
        event.preventDefault()
        ultimoControle.focus()
      } else if (!event.shiftKey && document.activeElement === ultimoControle) {
        event.preventDefault()
        primeiroControle.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, salvando])

  useEffect(() => {
    let requisicaoAtiva = true

    const consultaEnderecos = pedido?.cliente?.id
      ? listEnderecosPorCliente(pedido.cliente.id)
      : Promise.resolve([])

    Promise.all([listClientes(), consultaEnderecos])
      .then(([clientesRecebidos, enderecosRecebidos]) => {
        if (!requisicaoAtiva) return
        setClientes(clientesRecebidos)
        setEnderecos(enderecosRecebidos)
      })
      .catch((error) => {
        if (requisicaoAtiva) setErro(error.message || 'Não foi possível carregar os dados do formulário.')
      })
      .finally(() => {
        if (!requisicaoAtiva) return
        setCarregandoClientes(false)
        setCarregandoEnderecos(false)
      })

    return () => {
      requisicaoAtiva = false
    }
  }, [pedido])

  const selecionarCliente = async (event) => {
    const clienteId = Number(event.target.value)
    const cliente = clientes.find((item) => item.id === clienteId) || null
    const requisicaoAtual = requisicaoEnderecos.current + 1
    requisicaoEnderecos.current = requisicaoAtual

    setClienteSelecionado(cliente)
    setEnderecoSelecionado(null)
    setEnderecos([])
    setErro('')

    if (!cliente) {
      setCarregandoEnderecos(false)
      return
    }

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

    if (!produto.trim() || !descricao.trim() || !valor || !dataEntrega || !horario || !clienteSelecionado || !enderecoSelecionado) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    const dataPedido = `${dataEntrega}T${horario}:00`
    if (new Date(dataPedido) <= new Date()) {
      setErro('A data e o horário de entrega devem estar no futuro.')
      return
    }

    const pagamento = editando
      ? pedido.pagamento
      : STATUS_PAGAMENTO.find((item) => item.id === Number(pagamentoId))

    const payload = {
      produto: produto.trim(),
      descricao: descricao.trim(),
      valor: Number(valor),
      isAtivo: pedido?.isAtivo ?? true,
      isReagendado: false,
      dataPedido,
      entrega: editando ? pedido.entrega : ENTREGA_INICIAL,
      pagamento,
      cliente: clienteSelecionado,
      endereco: enderecoSelecionado,
    }

    setErro('')
    setSalvando(true)

    try {
      const pedidoSalvo = editando
        ? await atualizarPedido(pedido.id, payload)
        : await criarPedido(payload)
      onSaved(pedidoSalvo)
      onClose()
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className='pedido-modal-overlay'>
      <div ref={modalRef} className='pedido-modal' role='dialog' aria-modal='true' aria-labelledby='pedido-form-titulo' aria-busy={salvando}>
        <header className='pedido-modal-cabecalho'>
          <div>
            <h2 id='pedido-form-titulo'>{editando ? 'Editar pedido' : 'Novo pedido'}</h2>
            <p>{editando ? `Pedido Nº ${pedido.id}` : `Entrega em ${formatarData(dataSelecionada)}`}</p>
          </div>
          <button type='button' onClick={onClose} disabled={salvando} aria-label={editando ? 'Fechar edição de pedido' : 'Fechar cadastro de pedido'}>×</button>
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

            {editando ? (
              <label>
                Pagamento
                <input value={pedido.pagamento?.estado || '-'} readOnly />
              </label>
            ) : (
              <label>
                Pagamento*
                <select value={pagamentoId} onChange={(event) => setPagamentoId(event.target.value)} required>
                  {STATUS_PAGAMENTO.map((pagamento) => (
                    <option key={pagamento.id} value={pagamento.id}>{pagamento.estado}</option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Complemento
              <input value={enderecoSelecionado?.complemento || ''} readOnly placeholder='Sem complemento' />
            </label>

            <label>
              Data de entrega{editando ? '*' : ''}
              {editando ? (
                <input type='date' value={dataEntrega} min={hoje} onChange={(event) => setDataEntrega(event.target.value)} required />
              ) : (
                <input value={formatarData(dataSelecionada)} readOnly />
              )}
            </label>

            <label>
              Horário de entrega*
              <input type='time' value={horario} onChange={(event) => setHorario(event.target.value)} required />
            </label>

            <label>
              Andamento
              <input value={editando ? pedido.entrega?.estado || '-' : ENTREGA_INICIAL.estado} readOnly />
            </label>

            <label className='pedido-modal-descricao'>
              Descrição*
              <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} maxLength='200' required />
            </label>
          </div>

          {erro && <p className='pedido-modal-erro' role='alert'>{erro}</p>}

          <footer className='pedido-modal-acoes'>
            <button type='button' className='pedido-modal-cancelar' onClick={onClose} disabled={salvando}>Cancelar</button>
            <button type='submit' className='pedido-modal-salvar' disabled={salvando || carregandoClientes || carregandoEnderecos}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar pedido'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default PedidoFormModal
