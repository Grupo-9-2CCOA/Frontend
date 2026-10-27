import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { buscarPedidoPorId } from '../services/pedidoService'
import {
  buscarClientesRelatorio,
  buscarPedidosCancelados,
  buscarPedidosReagendados,
  buscarRelatorioGeral,
} from '../services/relatorioService'
import '../App.css'
import '../components/NovoPedidoModal.css'
import './Dashboard.css'

const PRESETS = [
  { id: '7-dias', texto: '7 dias', dias: 7 },
  { id: '30-dias', texto: '30 dias', dias: 30 },
  { id: '6-meses', texto: '6 meses', meses: 6 },
  { id: '1-ano', texto: '1 ano', anos: 1 },
  { id: 'personalizado', texto: 'Personalizado' },
]

const SECOES = {
  pedidos: { titulo: 'Pedidos realizados', icone: 'shopping_bag' },
  cancelados: { titulo: 'Pedidos cancelados', icone: 'cancel' },
  reagendados: { titulo: 'Pedidos reagendados', icone: 'event_repeat' },
  clientes: { titulo: 'Clientes', icone: 'group' },
}

const BUSCAS = {
  cancelados: buscarPedidosCancelados,
  reagendados: buscarPedidosReagendados,
  clientes: buscarClientesRelatorio,
}

function formatarDataInput(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function periodoDoPreset(preset) {
  const fim = new Date()
  const inicio = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate())
  const configuracao = PRESETS.find((item) => item.id === preset) || PRESETS[0]

  if (configuracao.dias) inicio.setDate(inicio.getDate() - configuracao.dias + 1)
  if (configuracao.meses) inicio.setMonth(inicio.getMonth() - configuracao.meses)
  if (configuracao.anos) inicio.setFullYear(inicio.getFullYear() - configuracao.anos)

  return { inicio: formatarDataInput(inicio), fim: formatarDataInput(fim) }
}

function criarDataHoraComOffset(data, horario) {
  const instanteLocal = new Date(`${data}T${horario.split('.')[0]}`)
  const minutosOffset = -instanteLocal.getTimezoneOffset()
  const sinal = minutosOffset >= 0 ? '+' : '-'
  const horas = String(Math.floor(Math.abs(minutosOffset) / 60)).padStart(2, '0')
  const minutos = String(Math.abs(minutosOffset) % 60).padStart(2, '0')
  return `${data}T${horario}${sinal}${horas}:${minutos}`
}

function criarFiltros(inicio, fim, minimoPedidosFidelizacao) {
  return {
    dataInicio: criarDataHoraComOffset(inicio, '00:00:00'),
    dataFim: criarDataHoraComOffset(fim, '23:59:59.999999999'),
    minimoPedidosFidelizacao,
  }
}

function formatarDataHora(valor) {
  if (!valor) return '-'
  const correspondencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!correspondencia) return valor
  const [, ano, mes, dia, hora, minuto] = correspondencia
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`
}

function formatarTelefone(valor) {
  const digitos = String(valor || '').replace(/\D/g, '')
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return valor || '-'
}

function formatarCpf(valor) {
  const digitos = String(valor || '').replace(/\D/g, '')
  if (digitos.length !== 11) return valor || '-'
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

function Diferenca({ valor, invertida = false }) {
  const numero = Number(valor || 0)
  const classe = numero > 0
    ? (invertida ? 'negativa' : 'positiva')
    : numero < 0
      ? (invertida ? 'positiva' : 'negativa')
      : 'neutra'
  const prefixo = numero > 0 ? '+' : ''
  const texto = numero === 0
    ? 'Mesmo valor do período anterior'
    : `${prefixo}${numero} vs. período anterior`

  return <span className={`dashboard-diferenca ${classe}`}>{texto}</span>
}

function Tabela({ secao, dados, carregando, erro, onPedidoClick }) {
  if (carregando) return <p className='dashboard-estado' role='status'>Carregando dados...</p>
  if (erro) return <p className='dashboard-estado erro' role='alert'>{erro}</p>
  if (!dados.length) return <p className='dashboard-estado'>Nenhum registro encontrado no período.</p>

  const colunas = {
    pedidos: ['Pedido', 'Produto', 'Criado em', 'Entrega', 'Pagamento'],
    cancelados: ['Pedido', 'Produto', 'Cliente', 'Telefone', 'Cancelado em'],
    reagendados: ['Pedido', 'Produto', 'Status', 'Criado em', 'Reagendado para', 'Pagamento'],
    clientes: ['Cliente', 'Nome', 'Telefone', 'CPF', 'Fidelização'],
  }[secao]

  const valores = {
    pedidos: (item) => [item.id, item.produto, formatarDataHora(item.dataCriacao), item.entrega?.estado || '-', item.pagamento?.estado || '-'],
    cancelados: (item) => [item.id, item.produto, item.nomeCliente || '-', formatarTelefone(item.telefoneCliente), formatarDataHora(item.dataCancelamento)],
    reagendados: (item) => [item.id, item.produto, item.status?.estado || '-', formatarDataHora(item.dataCriacao), formatarDataHora(item.dataReagendada), item.pagamento?.estado || '-'],
    clientes: (item) => {
      const clienteEhFidelizado = item.fidelizado === true || item.fidelizado === 'true' || item.fidelizado === 1
      return [
        item.id,
        item.nome,
        formatarTelefone(item.telefone),
        formatarCpf(item.cpf),
        clienteEhFidelizado ? 'Fidelizado' : 'Não fidelizado',
      ]
    },
  }

  return (
    <div className='dashboard-tabela-container'>
      <table className='dashboard-tabela'>
        <thead><tr>{colunas.map((coluna) => <th key={coluna} scope='col'>{coluna}</th>)}</tr></thead>
        <tbody>
          {dados.map((item) => {
            const valoresItem = valores[secao](item)
            const clicavel = secao !== 'clientes'
            return (
              <tr
                key={item.id}
                className={clicavel ? 'dashboard-row-clickable' : ''}
                onClick={clicavel ? () => onPedidoClick?.(item) : undefined}
                onKeyDown={clicavel ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onPedidoClick?.(item)
                  }
                } : undefined}
                tabIndex={clicavel ? 0 : undefined}
                aria-label={clicavel ? `Abrir detalhes do pedido ${item.id}` : undefined}
              >
                {valoresItem.map((valor, indice) => (
                  <td key={colunas[indice]} data-label={colunas[indice]}>
                    {secao === 'clientes' && colunas[indice] === 'Fidelização' ? (
                      <span className={`dashboard-fidelizacao ${valor === 'Fidelizado' ? 'fidelizado' : 'nao-fidelizado'}`}>
                        {valor}
                      </span>
                    ) : (valor ?? '-')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PedidoDetalhesModal({ pedido, onClose }) {
  if (!pedido) return null

  const enderecoFormatado = pedido.endereco
    ? `${pedido.endereco.logradouro}, ${pedido.endereco.numero}${pedido.endereco.complemento ? ` - ${pedido.endereco.complemento}` : ''}`
    : '-'

  return (
    <div className='pedido-modal-overlay'>
      <div className='pedido-modal' role='dialog' aria-modal='true' aria-labelledby='dashboard-pedido-modal-titulo'>
        <header className='pedido-modal-cabecalho'>
          <div>
            <h2 id='dashboard-pedido-modal-titulo'>Detalhes do pedido</h2>
            <p>Pedido Nº {pedido.id}</p>
          </div>
          <button type='button' className='modal-close' aria-label='Fechar detalhes do pedido' onClick={onClose}>×</button>
        </header>

        <div className='pedido-modal-grade'>
          <label>
            Produto
            <input value={pedido.produto || '-'} readOnly />
          </label>

          <label>
            Valor
            <input value={Number(pedido.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} readOnly />
          </label>

          <label>
            Cliente
            <input value={pedido.cliente?.nome || '-'} readOnly />
          </label>

          <label>
            Pagamento
            <input value={pedido.pagamento?.estado || '-'} readOnly />
          </label>

          <label>
            Andamento
            <input value={pedido.entrega?.estado || '-'} readOnly />
          </label>

          <label>
            Endereço
            <input value={enderecoFormatado} readOnly />
          </label>

          <label className='pedido-modal-descricao'>
            Descrição
            <textarea value={pedido.descricao || '-'} readOnly />
          </label>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const periodoInicial = periodoDoPreset('7-dias')
  const [preset, setPreset] = useState('7-dias')
  const [dataInicio, setDataInicio] = useState(periodoInicial.inicio)
  const [dataFim, setDataFim] = useState(periodoInicial.fim)
  const [minimo, setMinimo] = useState(2)
  const [filtros, setFiltros] = useState(() => criarFiltros(periodoInicial.inicio, periodoInicial.fim, 2))
  const [secao, setSecao] = useState('pedidos')
  const [geral, setGeral] = useState(null)
  const [listas, setListas] = useState({})
  const [pedidoDetalhes, setPedidoDetalhes] = useState(null)
  const [carregandoPedidoDetalhes, setCarregandoPedidoDetalhes] = useState(false)
  const [erroPedidoDetalhes, setErroPedidoDetalhes] = useState('')
  const [carregandoGeral, setCarregandoGeral] = useState(true)
  const [carregandoTabela, setCarregandoTabela] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  const [erroTabela, setErroTabela] = useState('')
  const [erroFiltro, setErroFiltro] = useState('')
  const secaoAtual = useRef('pedidos')
  const requisicaoGeral = useRef(0)
  const requisicaoTabela = useRef(0)

  const atualizarRelatorio = (inicio, fim, minimoPedidos) => {
    setErroFiltro('')
    setCarregandoGeral(true)
    setCarregandoTabela(secaoAtual.current !== 'pedidos')
    setErroGeral('')
    setErroTabela('')
    setListas({})
    setFiltros(criarFiltros(inicio, fim, minimoPedidos))
  }

  useEffect(() => {
    const idGeral = ++requisicaoGeral.current
    const secaoSelecionada = secaoAtual.current
    buscarRelatorioGeral(filtros)
      .then((dadosGerais) => {
        if (idGeral !== requisicaoGeral.current) return
        setGeral(dadosGerais)
      })
      .catch((error) => {
        if (idGeral !== requisicaoGeral.current) return
        setGeral(null)
        setErroGeral(error.message || 'Não foi possível carregar o dashboard.')
      })
      .finally(() => {
        if (idGeral !== requisicaoGeral.current) return
        setCarregandoGeral(false)
      })

    if (secaoSelecionada === 'pedidos') {
      return
    }

    const idTabela = ++requisicaoTabela.current
    BUSCAS[secaoSelecionada](filtros)
      .then((dados) => {
        if (idTabela !== requisicaoTabela.current) return
        setListas({ [secaoSelecionada]: dados || [] })
      })
      .catch((error) => {
        if (idTabela !== requisicaoTabela.current) return
        setErroTabela(error.message || 'Não foi possível carregar os dados.')
      })
      .finally(() => {
        if (idTabela === requisicaoTabela.current) setCarregandoTabela(false)
      })
  }, [filtros])

  const selecionarPreset = (novoPreset) => {
    setPreset(novoPreset)
    if (novoPreset === 'personalizado') return
    const periodo = periodoDoPreset(novoPreset)
    setDataInicio(periodo.inicio)
    setDataFim(periodo.fim)
    atualizarRelatorio(periodo.inicio, periodo.fim, Number(minimo))
  }

  const aplicarFiltros = (event) => {
    event.preventDefault()
    const minimoNumerico = Number(minimo)
    if (!dataInicio || !dataFim || dataInicio > dataFim) {
      setErroFiltro('Informe um período válido: a data inicial não pode ser posterior à final.')
      return
    }
    if (!Number.isInteger(minimoNumerico) || minimoNumerico < 1) {
      setErroFiltro('O mínimo de pedidos deve ser um número inteiro maior ou igual a 1.')
      return
    }
    atualizarRelatorio(dataInicio, dataFim, minimoNumerico)
  }

  const selecionarSecao = async (novaSecao) => {
    setSecao(novaSecao)
    secaoAtual.current = novaSecao
    setErroTabela('')
    const idTabela = ++requisicaoTabela.current
    if (novaSecao === 'pedidos' || listas[novaSecao]) {
      setCarregandoTabela(false)
      return
    }
    setCarregandoTabela(true)
    try {
      const dados = await BUSCAS[novaSecao](filtros)
      if (idTabela !== requisicaoTabela.current) return
      setListas((atuais) => ({ ...atuais, [novaSecao]: dados || [] }))
    } catch (error) {
      if (idTabela !== requisicaoTabela.current) return
      setErroTabela(error.message || 'Não foi possível carregar os dados.')
    } finally {
      if (idTabela === requisicaoTabela.current) setCarregandoTabela(false)
    }
  }

  const clientesTotal = Number(geral?.clientesFidelizados || 0) + Number(geral?.clientesNaoFidelizados || 0)
  const cards = [
    { id: 'pedidos', total: geral?.qtdPedidos, diferenca: geral?.diferencaQtdPedidos },
    { id: 'cancelados', total: geral?.pedidosCancelados, diferenca: geral?.diferencaCanceladas },
    { id: 'reagendados', total: geral?.pedidosReagendados, diferenca: geral?.diferencaReagendadas },
    { id: 'clientes', total: clientesTotal },
  ]
  const dadosTabela = secao === 'pedidos' ? geral?.pedidos || [] : listas[secao] || []
  const periodoAplicadoInicio = filtros.dataInicio.slice(0, 10).split('-').reverse().join('/')
  const periodoAplicadoFim = filtros.dataFim.slice(0, 10).split('-').reverse().join('/')
  const filtrosPendentes = dataInicio !== filtros.dataInicio.slice(0, 10)
    || dataFim !== filtros.dataFim.slice(0, 10)
    || Number(minimo) !== filtros.minimoPedidosFidelizacao

  const abrirDetalhesPedido = async (pedidoResumo) => {
    if (!pedidoResumo?.id) return

    setCarregandoPedidoDetalhes(true)
    setErroPedidoDetalhes('')

    try {
      const resposta = await buscarPedidoPorId(pedidoResumo.id)
      setPedidoDetalhes(resposta)
    } catch (error) {
      setPedidoDetalhes(null)
      setErroPedidoDetalhes(error.message || 'Não foi possível carregar os detalhes do pedido.')
    } finally {
      setCarregandoPedidoDetalhes(false)
    }
  }

  const fecharDetalhesPedido = () => {
    setPedidoDetalhes(null)
    setErroPedidoDetalhes('')
  }

  return (
    <div className='page-layout dashboard-page'>
      <Sidebar active='dashboard' />
      <main className='dashboard-main'>
        <header className='dashboard-header'>
          <h1>Dashboard</h1>
          <p>Acompanhe os resultados e os registros do período selecionado.</p>
        </header>

        <form className='dashboard-filtros' onSubmit={aplicarFiltros}>
          <fieldset>
            <legend>Período</legend>
            <div className='dashboard-presets'>
              {PRESETS.map((item) => (
                <button key={item.id} type='button' className={preset === item.id ? 'active' : ''} onClick={() => selecionarPreset(item.id)} aria-pressed={preset === item.id}>
                  {item.texto}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={`dashboard-campos-data ${preset === 'personalizado' ? 'visivel' : ''}`}>
            <label>Data inicial<input type='date' value={dataInicio} onChange={(event) => { setPreset('personalizado'); setDataInicio(event.target.value) }} required /></label>
            <label>Data final<input type='date' value={dataFim} onChange={(event) => { setPreset('personalizado'); setDataFim(event.target.value) }} required /></label>
          </div>
          <label className='dashboard-minimo'>Mínimo para fidelização
            <select value={minimo} onChange={(event) => setMinimo(Number(event.target.value))}>
              <option value='1'>1 pedido</option>
              <option value='2'>2 pedidos</option>
              <option value='3'>3 ou mais</option>
            </select>
          </label>
          <button type='submit' className='dashboard-aplicar' disabled={carregandoGeral}>Aplicar filtros</button>
          {erroFiltro && <p className='dashboard-filtro-erro' role='alert'>{erroFiltro}</p>}
          <p className={`dashboard-periodo-aplicado ${filtrosPendentes ? 'pendente' : ''}`} role='status'>
            {filtrosPendentes
              ? 'Há alterações pendentes. Clique em Aplicar filtros.'
              : `Exibindo de ${periodoAplicadoInicio} até ${periodoAplicadoFim}.`}
          </p>
        </form>

        {erroGeral && <p className='dashboard-alerta' role='alert'>{erroGeral}</p>}
        <section className='dashboard-cards' aria-label='Resumo do período' aria-busy={carregandoGeral}>
          {cards.map((card) => (
            <button key={card.id} type='button' className={`dashboard-card ${secao === card.id ? 'active' : ''}`} onClick={() => selecionarSecao(card.id)} aria-pressed={secao === card.id}>
              <span className='dashboard-card-topo'><span className='material-symbols-outlined' aria-hidden='true'>{SECOES[card.id].icone}</span>{SECOES[card.id].titulo}</span>
              <strong>{carregandoGeral ? '—' : Number(card.total || 0).toLocaleString('pt-BR')}</strong>
              {card.id === 'clientes' ? (
                <span className='dashboard-clientes-breakdown'>
                  <span>Fidelizados: {geral?.clientesFidelizados || 0}</span>
                  <span>Não fidelizados: {geral?.clientesNaoFidelizados || 0}</span>
                  <span>Novos: {geral?.clientesNovos || 0}</span>
                </span>
              ) : <Diferenca valor={card.diferenca} invertida={card.id === 'cancelados' || card.id === 'reagendados'} />}
            </button>
          ))}
        </section>

        <section className='dashboard-painel' aria-labelledby='dashboard-tabela-titulo'>
          <div className='dashboard-painel-titulo'>
            <div><h2 id='dashboard-tabela-titulo'>{SECOES[secao].titulo}</h2><p>Registros mais recentes do período</p></div>
            <span className='material-symbols-outlined' aria-hidden='true'>{SECOES[secao].icone}</span>
          </div>
          <Tabela
            secao={secao}
            dados={dadosTabela}
            carregando={carregandoGeral || carregandoTabela}
            erro={secao === 'pedidos' ? erroGeral : erroTabela}
            onPedidoClick={abrirDetalhesPedido}
          />
        </section>
      </main>

      {carregandoPedidoDetalhes && (
        <div className='pedido-modal-overlay'>
          <div className='pedido-modal'>
            <div className='pedido-modal-cabecalho'>
              <div>
                <h2>Detalhes do pedido</h2>
                <p>Carregando...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {erroPedidoDetalhes && (
        <div className='pedido-modal-overlay'>
          <div className='pedido-modal' role='alertdialog' aria-modal='true' aria-labelledby='dashboard-pedido-erro-titulo'>
            <header className='pedido-modal-cabecalho'>
              <div>
                <h2 id='dashboard-pedido-erro-titulo'>Detalhes indisponíveis</h2>
              </div>
              <button type='button' className='modal-close' aria-label='Fechar aviso' onClick={fecharDetalhesPedido}>×</button>
            </header>
            <p className='pedido-modal-erro'>{erroPedidoDetalhes}</p>
          </div>
        </div>
      )}

      <PedidoDetalhesModal pedido={pedidoDetalhes} onClose={fecharDetalhesPedido} />
    </div>
  )
}
