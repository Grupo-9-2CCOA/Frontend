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

export async function criarPedido(payload) {
  const resposta = await fetch(`${BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (resposta.status === 201) return resposta.json()

  let mensagem = 'Não foi possível cadastrar o pedido.'
  try {
    const corpo = await resposta.json()
    mensagem = corpo.mensagem || corpo.message || mensagem
  } catch {
    // Mantém a mensagem padrão quando o backend não retorna JSON.
  }

  const erro = new Error(mensagem)
  erro.status = resposta.status
  throw erro
}

export async function cancelarPedido(id) {
  const resposta = await fetch(`${BASE}/pedidos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (resposta.status === 204) return

  let mensagem = resposta.status === 404
    ? 'O pedido não foi encontrado.'
    : resposta.status === 502
      ? 'Não foi possível remover o evento do pedido no Google Calendar.'
      : 'Não foi possível cancelar o pedido.'
  try {
    const corpo = await resposta.json()
    mensagem = corpo.mensagem || corpo.message || mensagem
  } catch {
    // Mantém a mensagem padrão quando o backend não retorna JSON.
  }

  const erro = new Error(mensagem)
  erro.status = resposta.status
  throw erro
}

export async function atualizarStatusPedido(id, status) {
  const resposta = await fetch(`${BASE}/pedidos/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  })

  if (resposta.ok) return resposta.json()

  let mensagem = 'Não foi possível atualizar os status do pedido.'
  try {
    const corpo = await resposta.json()
    mensagem = corpo.mensagem || corpo.message || mensagem
  } catch {
    // Mantém a mensagem padrão quando o backend não retorna JSON.
  }

  const erro = new Error(mensagem)
  erro.status = resposta.status
  throw erro
}

export async function atualizarPedido(id, payload) {
  const resposta = await fetch(`${BASE}/pedidos/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (resposta.ok) return resposta.json()

  let mensagem = 'Não foi possível atualizar o pedido.'
  try {
    const corpo = await resposta.json()
    mensagem = corpo.mensagem || corpo.message || mensagem
  } catch {
    // Mantém a mensagem padrão quando o backend não retorna JSON.
  }

  const erro = new Error(mensagem)
  erro.status = resposta.status
  throw erro
}
