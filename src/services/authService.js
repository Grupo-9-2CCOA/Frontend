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
