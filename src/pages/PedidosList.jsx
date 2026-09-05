import { useEffect, useMemo, useRef, useState } from 'react'
import { atualizarStatusPedido, cancelarPedido, listarPedidos, listarPedidosPorData } from '../services/pedidoService'
import { STATUS_ENTREGA, STATUS_PAGAMENTO } from '../constants/statusPedido'
import Sidebar from '../components/Sidebar'
import PedidoFormModal from '../components/PedidoFormModal'
import ConfirmModal from '../components/ConfirmModal'

import '../App.css'
import './PedidosList.css'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatarDataApi(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarDataExibicao(dataPedido) {
  if (!dataPedido) return '-'
  const [ano, mes, dia] = dataPedido.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function classeEntrega(estado = '') {
  const classes = {
    Pendente: 'pendente',
    'Em trânsito': 'em-transito',
    Entregue: 'entregue',
    Cancelado: 'cancelado',
  }
  return classes[estado] || 'pendente'
}

function classePagamento(estado = '') {
  const classes = {
    Pago: 'pago',
    Pendente: 'nao-pago',
    Cancelado: 'cancelado',
  }
  return classes[estado] || 'nao-pago'
}

function PedidosList() {
  const hoje = useMemo(() => new Date(), [])
  const hojeFormatado = useMemo(() => formatarDataApi(hoje), [hoje])
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [mesExibido, setMesExibido] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false)
  const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [avisoCadastro, setAvisoCadastro] = useState('')
  const [atualizacaoLista, setAtualizacaoLista] = useState(0)
  const [confirmacaoCancelamentoAberta, setConfirmacaoCancelamentoAberta] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [erroCancelamento, setErroCancelamento] = useState(null)
  const [pagamentoId, setPagamentoId] = useState('')
  const [entregaId, setEntregaId] = useState('')
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [erroStatus, setErroStatus] = useState('')
  const requisicaoStatus = useRef(0)

  useEffect(() => {
    let requisicaoAtiva = true

    const consulta = dataSelecionada
      ? listarPedidosPorData(dataSelecionada)
      : listarPedidos()

    consulta
      .then((dados) => {
        if (!requisicaoAtiva) return

        const pedidosExibidos = dataSelecionada
          ? dados
          : dados
              .filter((pedido) => pedido.dataPedido?.slice(0, 10) >= hojeFormatado)
              .sort((pedidoA, pedidoB) => new Date(pedidoA.dataPedido) - new Date(pedidoB.dataPedido))

        setPedidos(pedidosExibidos)
        const primeiroPedido = pedidosExibidos[0] || null
        setPedidoSelecionado(primeiroPedido)
        setPagamentoId(primeiroPedido?.pagamento?.id ? String(primeiroPedido.pagamento.id) : '')
        setEntregaId(primeiroPedido?.entrega?.id ? String(primeiroPedido.entrega.id) : '')
        setErroStatus('')
      })
      .catch((error) => {
        if (!requisicaoAtiva) return
        setPedidos([])
        setPedidoSelecionado(null)
        setErro(error.message)
      })
      .finally(() => {
        if (requisicaoAtiva) setCarregando(false)
      })

    return () => {
      requisicaoAtiva = false
    }
  }, [dataSelecionada, hojeFormatado, atualizacaoLista])

  const diasDoMes = useMemo(() => {
    const ano = mesExibido.getFullYear()
    const mes = mesExibido.getMonth()
    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay()
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate()
    const espacos = Array.from({ length: primeiroDiaDaSemana }, () => null)
    const dias = Array.from({ length: quantidadeDias }, (_, indice) => indice + 1)
    return [...espacos, ...dias]
  }, [mesExibido])

  const selecionarData = (dia) => {
    const novaData = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia)
    const dataFormatada = formatarDataApi(novaData)
    if (dataFormatada === dataSelecionada) return

    setCarregando(true)
    setErro('')
    setMensagemSucesso('')
    setAvisoCadastro('')
    setPedidoSelecionado(null)
    setPagamentoId('')
    setEntregaId('')
    setErroStatus('')
    requisicaoStatus.current += 1
    setDataSelecionada(dataFormatada)
  }

  const mostrarProximosPedidos = () => {
    if (!dataSelecionada) return
    setCarregando(true)
    setErro('')
    setMensagemSucesso('')
    setAvisoCadastro('')
    setPedidoSelecionado(null)
    setPagamentoId('')
    setEntregaId('')
    setErroStatus('')
    requisicaoStatus.current += 1
    setDataSelecionada(null)
  }

  const abrirNovoPedido = () => {
    if (dataSelecionada < hojeFormatado) {
      setAvisoCadastro('Não é possível cadastrar um pedido em uma data anterior a hoje.')
      return
    }

    setAvisoCadastro('')
    setNovoPedidoAberto(true)
  }

  const pedidoCriado = () => {
    setMensagemSucesso('Pedido cadastrado com sucesso.')
    setAtualizacaoLista((valorAtual) => valorAtual + 1)
  }

  const pedidoEditado = () => {
    setPedidoEmEdicao(null)
    setPedidoSelecionado(null)
    setMensagemSucesso('Pedido atualizado com sucesso.')
    setCarregando(true)
    setAtualizacaoLista((valorAtual) => valorAtual + 1)
  }

  const abrirConfirmacaoCancelamento = () => {
    if (salvandoStatus) return
    setErroCancelamento(null)
    setConfirmacaoCancelamentoAberta(true)
  }

  const abrirEdicaoPedido = () => {
    if (!pedidoSelecionado || salvandoStatus) return
    setPedidoEmEdicao(pedidoSelecionado)
    setMensagemSucesso('')
    setErroStatus('')
  }

  const fecharConfirmacaoCancelamento = () => {
    if (cancelando) return
    setConfirmacaoCancelamentoAberta(false)
    setErroCancelamento(null)
  }

  const confirmarCancelamento = async () => {
    if (!pedidoSelecionado?.id || cancelando) return

    setCancelando(true)
    setErroCancelamento(null)

    try {
      await cancelarPedido(pedidoSelecionado.id)
      setConfirmacaoCancelamentoAberta(false)
      setPedidos((pedidosAtuais) => pedidosAtuais.filter((pedido) => pedido.id !== pedidoSelecionado.id))
      setPedidoSelecionado(null)
      setPagamentoId('')
      setEntregaId('')
      setErroStatus('')
      setMensagemSucesso('Pedido cancelado com sucesso.')
      setCarregando(true)
      setAtualizacaoLista((valorAtual) => valorAtual + 1)
    } catch (error) {
      if (error.status === 404) {
        setConfirmacaoCancelamentoAberta(false)
        setPedidos((pedidosAtuais) => pedidosAtuais.filter((pedido) => pedido.id !== pedidoSelecionado.id))
        setPedidoSelecionado(null)
        setPagamentoId('')
        setEntregaId('')
        setErroStatus('')
        setAvisoCadastro('O pedido não foi encontrado. A lista foi atualizada.')
        setCarregando(true)
        setAtualizacaoLista((valorAtual) => valorAtual + 1)
      } else {
        setErroCancelamento(error)
      }
    } finally {
      setCancelando(false)
    }
  }

  const selecionarPedido = (pedido) => {
    requisicaoStatus.current += 1
    setPedidoSelecionado(pedido)
    setPagamentoId(pedido.pagamento?.id ? String(pedido.pagamento.id) : '')
    setEntregaId(pedido.entrega?.id ? String(pedido.entrega.id) : '')
    setErroStatus('')
    setMensagemSucesso('')
  }

  const salvarStatus = async () => {
    if (!pedidoSelecionado?.id || !pagamentoId || !entregaId || salvandoStatus || cancelando) return

    const pedidoId = pedidoSelecionado.id
    const requisicaoAtual = requisicaoStatus.current + 1
    requisicaoStatus.current = requisicaoAtual

    setSalvandoStatus(true)
    setErroStatus('')
    setMensagemSucesso('')

    try {
      const pedidoAtualizado = await atualizarStatusPedido(pedidoId, {
        pagamentoId: Number(pagamentoId),
        entregaId: Number(entregaId),
      })

      if (requisicaoAtual !== requisicaoStatus.current) return
      setPedidos((pedidosAtuais) => pedidosAtuais.map((pedido) => (
        pedido.id === pedidoAtualizado.id ? pedidoAtualizado : pedido
      )))
      setPedidoSelecionado(pedidoAtualizado)
      setPagamentoId(String(pedidoAtualizado.pagamento.id))
      setEntregaId(String(pedidoAtualizado.entrega.id))
      setMensagemSucesso('Status do pedido atualizado com sucesso.')
    } catch (error) {
      if (requisicaoAtual === requisicaoStatus.current) setErroStatus(error.message)
    } finally {
      setSalvandoStatus(false)
    }
  }

  const mudarMes = (quantidade) => {
    setMesExibido((mesAtual) => new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + quantidade,
      1,
    ))
  }

  const enderecoSelecionado = pedidoSelecionado?.endereco
  const enderecoFormatado = enderecoSelecionado
    ? `${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero}${enderecoSelecionado.complemento ? ` - ${enderecoSelecionado.complemento}` : ''}`
    : '-'
  const statusFoiAlterado = pedidoSelecionado && (
    Number(pagamentoId) !== pedidoSelecionado.pagamento?.id
    || Number(entregaId) !== pedidoSelecionado.entrega?.id
  )

  return (
    <div className='page-layout pedidos-page'>
      <Sidebar active='pedidos' />

      <main className='pedidos-main'>
        <header className='pedidos-header'>
          <div>
            <h1>Pedidos</h1>
            <p>
              {dataSelecionada
                ? `Pedidos de ${formatarDataExibicao(`${dataSelecionada}T00:00:00`)}`
                : 'Próximos pedidos por data de entrega'}
            </p>
          </div>

          <div className='pedidos-acoes-cabecalho'>
            {dataSelecionada && (
              <button type='button' className='btn-novo-pedido' onClick={abrirNovoPedido}>
                + Novo pedido
              </button>
            )}
            {dataSelecionada && (
              <button type='button' className='btn-proximos-pedidos' onClick={mostrarProximosPedidos}>
                Ver próximos pedidos
              </button>
            )}
            <div className='pagamento-legenda' aria-label='Legenda de pagamento'>
              <span><i className='pagamento-ponto pago' /> Pago</span>
              <span><i className='pagamento-ponto nao-pago' /> Pendente</span>
              <span><i className='pagamento-ponto cancelado' /> Cancelado</span>
            </div>
          </div>
        </header>

        {mensagemSucesso && <p className='pedidos-sucesso' role='status'>{mensagemSucesso}</p>}
        {avisoCadastro && <p className='pedidos-aviso' role='alert'>{avisoCadastro}</p>}

        <section className='pedidos-tabela-painel' aria-busy={carregando}>
          {carregando && <p className='pedidos-mensagem pedidos-mensagem-loading'>Carregando pedidos...</p>}
          {erro && <p className='pedidos-mensagem erro' role='alert'>{erro}</p>}
          {!carregando && !erro && pedidos.length === 0 && (
            <p className='pedidos-mensagem'>Nenhum pedido encontrado nesta data.</p>
          )}

          {!carregando && !erro && pedidos.length > 0 && (
            <div className='pedidos-tabela-container'>
              <table className='pedidos-tabela'>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Produto</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido, indice) => (
                    <tr
                      key={pedido.id || `${pedido.produto}-${pedido.dataPedido}-${indice}`}
                      className={pedidoSelecionado === pedido ? 'selecionado' : ''}
                      onClick={() => selecionarPedido(pedido)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          selecionarPedido(pedido)
                        }
                      }}
                      tabIndex='0'
                      aria-selected={pedidoSelecionado === pedido}
                    >
                      <td>Nº {pedido.id || indice + 1}</td>
                      <td>{pedido.produto}</td>
                      <td>
                        <span className={`status-pedido ${classeEntrega(pedido.entrega?.estado)}`}>
                          {pedido.entrega?.estado || 'Pendente'}
                        </span>
                      </td>
                      <td>{formatarDataExibicao(pedido.dataPedido)}</td>
                      <td className='pagamento-celula'>
                        <span
                          className={`pagamento-ponto ${classePagamento(pedido.pagamento?.estado)}`}
                          title={pedido.pagamento?.estado || 'Pendente'}
                        />
                        <span>{pedido.pagamento?.estado || 'Pendente'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className='pedidos-inferior'>
          <section className='calendario-painel'>
            <div className='calendario-cabecalho'>
              <button type='button' onClick={() => mudarMes(-1)} aria-label='Mês anterior'>‹</button>
              <strong>{MESES[mesExibido.getMonth()]} de {mesExibido.getFullYear()}</strong>
              <button type='button' onClick={() => mudarMes(1)} aria-label='Próximo mês'>›</button>
            </div>

            <div className='calendario-semana' aria-hidden='true'>
              <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span>
              <span>Qui</span><span>Sex</span><span>Sáb</span>
            </div>

            <div className='calendario-dias'>
              {diasDoMes.map((dia, indice) => dia ? (
                <button
                  type='button'
                  key={dia}
                  className={dataSelecionada === formatarDataApi(new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia)) ? 'selecionado' : ''}
                  onClick={() => selecionarData(dia)}
                  aria-pressed={dataSelecionada === formatarDataApi(new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia))}
                  aria-label={`${dia} de ${MESES[mesExibido.getMonth()]} de ${mesExibido.getFullYear()}`}
                >
                  {dia}
                </button>
              ) : <span key={`espaco-${indice}`} />)}
            </div>
          </section>

          <section className='pedido-detalhes'>
            <div className='pedido-detalhes-cabecalho'>
              <h2>Detalhes do pedido</h2>
              {pedidoSelecionado && (
                <div className='pedido-detalhes-acoes'>
                  <button type='button' className='btn-editar-pedido' onClick={abrirEdicaoPedido} disabled={salvandoStatus}>
                    Editar pedido
                  </button>
                  <button type='button' className='btn-cancelar-pedido' onClick={abrirConfirmacaoCancelamento} disabled={salvandoStatus}>
                    Cancelar pedido
                  </button>
                </div>
              )}
            </div>
            {!pedidoSelecionado ? (
              <p className='detalhes-vazio'>Selecione um pedido para visualizar seus dados.</p>
            ) : (
              <div className='detalhes-grade'>
                <div><span>Produto</span><strong>{pedidoSelecionado.produto}</strong></div>
                <div><span>Valor</span><strong>{formatarValor(pedidoSelecionado.valor)}</strong></div>
                <div><span>Cliente</span><strong>{pedidoSelecionado.cliente?.nome || '-'}</strong></div>
                <div><span>Pagamento</span><strong>{pedidoSelecionado.pagamento?.estado || '-'}</strong></div>
                <div><span>Andamento</span><strong>{pedidoSelecionado.entrega?.estado || '-'}</strong></div>
                <div className='detalhe-largo'><span>Descrição</span><strong>{pedidoSelecionado.descricao || '-'}</strong></div>
                <div className='detalhe-largo'><span>Endereço</span><strong>{enderecoFormatado}</strong></div>
              </div>
            )}

            {pedidoSelecionado && (
              <div className='status-rapido'>
                <h3>Atualizar status</h3>
                <div className='status-rapido-campos'>
                  <label>
                    Pagamento
                    <select value={pagamentoId} onChange={(event) => setPagamentoId(event.target.value)} disabled={salvandoStatus}>
                      {STATUS_PAGAMENTO.map((status) => (
                        <option key={status.id} value={status.id}>{status.estado}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Andamento
                    <select value={entregaId} onChange={(event) => setEntregaId(event.target.value)} disabled={salvandoStatus}>
                      {STATUS_ENTREGA.map((status) => (
                        <option key={status.id} value={status.id}>{status.estado}</option>
                      ))}
                    </select>
                  </label>

                  <button type='button' onClick={salvarStatus} disabled={!statusFoiAlterado || salvandoStatus}>
                    {salvandoStatus ? 'Atualizando...' : 'Atualizar status'}
                  </button>
                </div>
                {erroStatus && <p className='status-rapido-erro' role='alert'>{erroStatus}</p>}
              </div>
            )}
          </section>
        </div>
      </main>

      {novoPedidoAberto && dataSelecionada && (
        <PedidoFormModal
          dataSelecionada={dataSelecionada}
          onClose={() => setNovoPedidoAberto(false)}
          onSaved={pedidoCriado}
        />
      )}

      {pedidoEmEdicao && (
        <PedidoFormModal
          pedido={pedidoEmEdicao}
          onClose={() => setPedidoEmEdicao(null)}
          onSaved={pedidoEditado}
        />
      )}

      <ConfirmModal
        open={confirmacaoCancelamentoAberta}
        title='Cancelar pedido'
        message={pedidoSelecionado ? `Deseja cancelar o pedido Nº ${pedidoSelecionado.id} - ${pedidoSelecionado.produto}?` : ''}
        onCancel={fecharConfirmacaoCancelamento}
        onConfirm={confirmarCancelamento}
        error={erroCancelamento}
        loading={cancelando}
      />
    </div>
  )
}

export default PedidosList
