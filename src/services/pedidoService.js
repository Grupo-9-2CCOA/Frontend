const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const TAMANHO_PAGINA_PADRAO = 10

function normalizarListaPedidos(dados) {
  if (Array.isArray(dados)) return dados
  if (Array.isArray(dados?.content)) return dados.content
  if (Array.isArray(dados?.pedidos)) return dados.pedidos
  if (Array.isArray(dados?.data)) return dados.data
  return []
}

function normalizarPaginaPedidos(dados) {
  const conteudo = normalizarListaPedidos(dados)
  const paginaAtual = Number(dados?.number ?? dados?.page ?? dados?.paginaAtual ?? 0)
  const tamanhoPagina = Number(dados?.size ?? dados?.pageSize ?? dados?.tamanho ?? dados?.tamPag ?? TAMANHO_PAGINA_PADRAO)
  const totalElementos = Number(dados?.totalElements ?? dados?.total_elements ?? dados?.total ?? dados?.totalRegistros ?? dados?.qtdTotal ?? conteudo.length)
  const totalPaginasInformado = Number(dados?.totalPages ?? dados?.total_pages ?? dados?.total_paginas ?? 0)
  const totalPaginasCalculado = totalPaginasInformado > 0
    ? totalPaginasInformado
    : Number.isFinite(tamanhoPagina) && tamanhoPagina > 0
      ? Math.ceil((Number.isFinite(totalElementos) && totalElementos > 0 ? totalElementos : conteudo.length) / tamanhoPagina)
      : 1

  return {
    pedidos: conteudo,
    paginaAtual: Number.isFinite(paginaAtual) ? paginaAtual : 0,
    totalPaginas: Number.isFinite(totalPaginasCalculado) && totalPaginasCalculado > 0 ? totalPaginasCalculado : 1,
    totalElementos: Number.isFinite(totalElementos) ? totalElementos : conteudo.length,
    tamanhoPagina: Number.isFinite(tamanhoPagina) && tamanhoPagina > 0 ? tamanhoPagina : TAMANHO_PAGINA_PADRAO,
  }
}

function paginaVazia(pagina, tamanho) {
  return {
    pedidos: [],
    paginaAtual: Number.isFinite(Number(pagina)) ? Number(pagina) : 0,
    totalPaginas: 1,
    totalElementos: 0,
    tamanhoPagina: Number.isFinite(Number(tamanho)) && Number(tamanho) > 0 ? Number(tamanho) : TAMANHO_PAGINA_PADRAO,
  }
}

export async function listarPedidos(pagina = 0, tamanho = TAMANHO_PAGINA_PADRAO) {
  const parametros = new URLSearchParams({
    page: String(pagina),
    size: String(tamanho),
  })

  const resposta = await fetch(`${BASE}/pedidos?${parametros}`, {
    credentials: 'include',
  })

  if (resposta.status === 204) return paginaVazia(pagina, tamanho)
  if (resposta.ok) return normalizarPaginaPedidos(await resposta.json())

  const erro = new Error('Não foi possível carregar os próximos pedidos.')
  erro.status = resposta.status
  throw erro
}

export async function listarPedidosPorData(data, pagina = 0, tamanho = TAMANHO_PAGINA_PADRAO) {
  const parametros = new URLSearchParams({
    dataInicio: `${data}T00:00:00`,
    dataFim: `${data}T23:59:59`,
    page: String(pagina),
    size: String(tamanho),
  })

  const resposta = await fetch(`${BASE}/pedidos/listarData?${parametros}`, {
    credentials: 'include',
  })

  if (resposta.status === 204) return paginaVazia(pagina, tamanho)
  if (resposta.ok) return normalizarPaginaPedidos(await resposta.json())

  const erro = new Error('Não foi possível carregar os pedidos desta data.')
  erro.status = resposta.status
  throw erro
}

export async function buscarPedidoPorId(id) {
  const resposta = await fetch(`${BASE}/pedidos/${id}`, {
    credentials: 'include',
  })

  if (resposta.ok) return resposta.json()

  let mensagem = 'Não foi possível carregar os detalhes do pedido.'
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
