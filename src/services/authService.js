const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function login(usuario, senha) {
  const resposta = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ usuario, senha }),
  })

  if (resposta.ok) {
    return resposta.json()
  }

  const erro = new Error(
    resposta.status === 401
      ? 'Usuário ou senha inválidos.'
      : 'Não foi possível entrar. Tente novamente.'
  )
  erro.status = resposta.status
  throw erro
}

export async function trocarSenha(senha) {
  const resposta = await fetch(`${BASE}/admin/trocar-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ senha }),
  })

  if (resposta.ok) return

  let mensagem = 'Não foi possível trocar a senha. Tente novamente.'
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

export async function logout() {
  const resposta = await fetch(`${BASE}/admin/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (resposta.ok) return

  const erro = new Error('Não foi possível sair. Tente novamente.')
  erro.status = resposta.status
  throw erro
}

export async function verificarSessao() {
  const resposta = await fetch(`${BASE}/admin/sessao`, {
    credentials: 'include',
  })

  if (resposta.ok) return

  const erro = new Error('Sua sessão não está ativa.')
  erro.status = resposta.status
  throw erro
}
