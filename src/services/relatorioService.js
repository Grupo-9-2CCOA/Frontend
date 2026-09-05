const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

async function buscarRelatorio(caminho, filtros) {
  const parametros = new URLSearchParams({
    dataInicio: filtros.dataInicio,
    dataFim: filtros.dataFim,
    minimoPedidosFidelizacao: String(filtros.minimoPedidosFidelizacao),
  })
  const resposta = await fetch(`${BASE}${caminho}?${parametros}`, {
    credentials: 'include',
  })

  if (resposta.status === 204) return caminho === '/relatorio' ? null : []
  if (resposta.ok) return resposta.json()

  let mensagem = 'Não foi possível carregar os dados do relatório.'
  try {
    const corpo = await resposta.json()
    mensagem = corpo.mensagem || corpo.message || (typeof corpo === 'string' ? corpo : mensagem)
  } catch {
    /** Mantém a mensagem padrão quando o backend não retorna JSON. */
  }

  const erro = new Error(mensagem)
  erro.status = resposta.status
  throw erro
}

export function buscarRelatorioGeral(filtros) {
  return buscarRelatorio('/relatorio', filtros)
}

export function buscarPedidosCancelados(filtros) {
  return buscarRelatorio('/relatorio/cancelados', filtros)
}

export function buscarPedidosReagendados(filtros) {
  return buscarRelatorio('/relatorio/reagendados', filtros)
}

export function buscarClientesRelatorio(filtros) {
  return buscarRelatorio('/relatorio/clientes', filtros)
}
