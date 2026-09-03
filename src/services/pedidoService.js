const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function listarPedidos() {
  const resposta = await fetch(`${BASE}/pedidos`, {
    credentials: 'include',
  })

  if (resposta.status === 204) return []
  if (resposta.ok) return resposta.json()

  const erro = new Error('Não foi possível carregar os próximos pedidos.')
  erro.status = resposta.status
  throw erro
}

export async function listarPedidosPorData(data) {
  const parametros = new URLSearchParams({
    dataInicio: `${data}T00:00:00`,
    dataFim: `${data}T23:59:59`,
  })

  const resposta = await fetch(`${BASE}/pedidos/listarData?${parametros}`, {
    credentials: 'include',
  })

  if (resposta.status === 204) return []
  if (resposta.ok) return resposta.json()

  const erro = new Error('Não foi possível carregar os pedidos desta data.')
  erro.status = resposta.status
  throw erro
}
