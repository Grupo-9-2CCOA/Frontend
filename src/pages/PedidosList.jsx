import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarPedidos, listarPedidosPorData } from '../services/pedidoService'
import { logout } from '../services/authService'
import NovoPedidoModal from '../components/NovoPedidoModal'

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
  const navigate = useNavigate()
  const hoje = useMemo(() => new Date(), [])
  const hojeFormatado = useMemo(() => formatarDataApi(hoje), [hoje])
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [mesExibido, setMesExibido] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [avisoCadastro, setAvisoCadastro] = useState('')
  const [atualizacaoLista, setAtualizacaoLista] = useState(0)
  const [saindo, setSaindo] = useState(false)

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
        setPedidoSelecionado(pedidosExibidos[0] || null)
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
    setDataSelecionada(dataFormatada)
  }

  const mostrarProximosPedidos = () => {
    if (!dataSelecionada) return
    setCarregando(true)
    setErro('')
    setMensagemSucesso('')
    setAvisoCadastro('')
    setPedidoSelecionado(null)
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

  return (
    <div className='page-layout pedidos-page'>
      <aside className='sidebar'>
        <div className='sidebar-brand'>
          <span className='material-symbols-outlined brand-icon'>cake</span>
          <p className='sidebar-logo'>Doces com Amor</p>
        </div>

        <nav>
          <a href='#'><span className='material-symbols-outlined'>dashboard</span> Dashboard</a>
          <Link to='/pedidos' className='active'><span className='material-symbols-outlined'>shopping_bag</span> Pedidos</Link>
          <a href='#'><span className='material-symbols-outlined'>calendar_month</span> Calendário</a>
          <Link to='/clientes'><span className='material-symbols-outlined'>group</span> Clientes</Link>
          <a href='#'><span className='material-symbols-outlined'>settings_heart</span> Configurações</a>
        </nav>

        <button type='button' className='sidebar-logout' onClick={handleLogout} disabled={saindo}>
          <span className='material-symbols-outlined'>logout</span>
          {saindo ? 'Saindo...' : 'Sair'}
        </button>
      </aside>

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

        <section className='pedidos-tabela-painel'>
          {carregando && <p className='pedidos-mensagem'>Carregando pedidos...</p>}
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
                      key={`${pedido.produto}-${pedido.dataPedido}-${indice}`}
                      className={pedidoSelecionado === pedido ? 'selecionado' : ''}
                      onClick={() => setPedidoSelecionado(pedido)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setPedidoSelecionado(pedido)
                        }
                      }}
                      tabIndex='0'
                      aria-selected={pedidoSelecionado === pedido}
                    >
                      <td>Nº {indice + 1}</td>
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
            <h2>Detalhes do pedido</h2>
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
          </section>
        </div>
      </main>

      {novoPedidoAberto && dataSelecionada && (
        <NovoPedidoModal
          dataSelecionada={dataSelecionada}
          onClose={() => setNovoPedidoAberto(false)}
          onCreated={pedidoCriado}
        />
      )}
    </div>
  )
}

export default PedidosList
