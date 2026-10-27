const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const TAMANHO_PAGINA_PADRAO = 10;

function paginaVazia(pagina = 0, tamanho = TAMANHO_PAGINA_PADRAO) {
  return {
    clientes: [],
    content: [],
    page: Number.isFinite(Number(pagina)) ? Number(pagina) : 0,
    size: Number.isFinite(Number(tamanho)) && Number(tamanho) > 0 ? Number(tamanho) : TAMANHO_PAGINA_PADRAO,
    totalPages: 1,
    totalElements: 0,
  };
}

function normalizarPaginaClientes(dados) {
  const content = Array.isArray(dados?.content) ? dados.content : Array.isArray(dados) ? dados : [];
  const page = Number(dados?.number ?? dados?.page ?? 0);
  const size = Number(dados?.size ?? dados?.pageSize ?? TAMANHO_PAGINA_PADRAO);
  const totalPages = Number(dados?.totalPages ?? 1);
  const totalElements = Number(dados?.totalElements ?? content.length);

  return {
    clientes: content,
    content,
    page: Number.isFinite(page) ? page : 0,
    size: Number.isFinite(size) && size > 0 ? size : TAMANHO_PAGINA_PADRAO,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
  };
}

export async function listClientes(pagina = 0, tamanho = TAMANHO_PAGINA_PADRAO) {
  const parametros = new URLSearchParams({
    page: String(pagina),
    size: String(tamanho),
    sort: 'nome,asc',
  });

  const res = await fetch(`${BASE}/clientes?${parametros}`, { credentials: 'include' });
  if (res.status === 204) return paginaVazia(pagina, tamanho);
  if (!res.ok) throw new Error(`Erro ao listar clientes: ${res.status}`);
  const dados = await res.json();
  return normalizarPaginaClientes(dados);
}

export async function listClientesInativos(pagina = 0, tamanho = TAMANHO_PAGINA_PADRAO) {
  const parametros = new URLSearchParams({
    page: String(pagina),
    size: String(tamanho),
    sort: 'nome,asc',
  });

  const res = await fetch(`${BASE}/clientes/inativos?${parametros}`, { credentials: 'include' });
  if (res.status === 204) return paginaVazia(pagina, tamanho);
  if (!res.ok) throw new Error(`Erro ao listar clientes inativos: ${res.status}`);
  const dados = await res.json();
  return normalizarPaginaClientes(dados);
}

export async function getCliente(id) {
  const res = await fetch(`${BASE}/clientes/${id}`, { credentials: 'include' });
  if (res.status === 404) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error(`Erro ao buscar cliente: ${res.status}`);
  return res.json();
}

export async function createCliente(payload) {
  const res = await fetch(`${BASE}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (res.status === 201) return res.json();
  if (res.status === 400) {
    const text = await res.text().catch(() => null);
    const err = new Error(text || 'Dados inválidos');
    err.status = 400;
    throw err;
  }
  if (res.status === 409) {
    const err = new Error('CPF duplicado');
    err.status = 409;
    throw err;
  }
  const err = new Error('Erro ao criar cliente');
  err.status = res.status;
  throw err;
}

function _normalizeEndereco(en) {
  if (!en || typeof en !== 'object') return en;
  const candidates = [en.id, en.enderecoId, en.idEndereco, en.codigo, en._id];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') {
      // preserve numeric typing when possible
      const num = Number(c);
      if (Number.isFinite(num)) {
        return { ...en, id: num };
      }
      return { ...en, id: c };
    }
  }
  return en;
}

function normalizarListaEnderecos(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.content)) return dados.content;
  if (Array.isArray(dados?.enderecos)) return dados.enderecos;
  if (Array.isArray(dados?.data)) return dados.data;
  return [];
}

export async function listEnderecosPorCliente(clienteId) {
  const res = await fetch(`${BASE}/enderecos/${clienteId}`, { credentials: 'include' });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`Erro ao listar endereços: ${res.status}`);
  const data = await res.json();
  return normalizarListaEnderecos(data).map(_normalizeEndereco);
}

export async function createEndereco(clienteId, payload) {
  const res = await fetch(`${BASE}/enderecos/${clienteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (res.status === 201) {
    const created = await res.json();
    return _normalizeEndereco(created);
  }
  if (res.status === 400) {
    // Try to parse structured validation error from backend
    let parsed = null;
    try {
      parsed = await res.json();
    } catch {
      // fallback to text
    }

    const err = new Error('Dados inválidos');
    err.status = 400;

    if (parsed && Array.isArray(parsed.errors)) {
      // build fieldErrors: { field, messages: [] }
      const fieldMap = {};
      parsed.errors.forEach((it) => {
        const field = it.field || (it.arguments && it.arguments[0] && it.arguments[0].defaultMessage) || 'campo';
        const msg = it.defaultMessage || it.message || 'inválido';
        fieldMap[field] = fieldMap[field] || new Set();
        fieldMap[field].add(msg);
      });
      err.fieldErrors = Object.entries(fieldMap).map(([field, msgs]) => ({ field, messages: Array.from(msgs) }));
    } else if (parsed && parsed.message) {
      err.message = parsed.message;
    } else {
      // fallback to raw text
      try {
        const text = await res.text();
        if (text) err.message = text;
      } catch {
        // Mantém a mensagem padrão quando a resposta não possui texto.
      }
    }

    throw err;
  }
  if (res.status === 404) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }
  const err = new Error('Erro ao criar endereço');
  err.status = res.status;
  throw err;
}

export async function updateCliente(id, payload) {
  const res = await fetch(`${BASE}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (res.status === 200) return res.json();
  if (res.status === 404) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }
  if (res.status === 400) {
    const text = await res.text().catch(() => null);
    const err = new Error(text || 'Dados inválidos');
    err.status = 400;
    throw err;
  }
  const err = new Error('Erro ao atualizar cliente');
  err.status = res.status;
  throw err;
}

export async function updateEndereco(enderecoId, payload) {
  if (enderecoId === undefined || enderecoId === null) {
    const err = new Error('ID do endereço ausente');
    err.status = 400;
    throw err;
  }
  const id = Number(enderecoId);
  if (!Number.isFinite(id)) {
    const err = new Error('ID do endereço inválido');
    err.status = 400;
    throw err;
  }

  const res = await fetch(`${BASE}/enderecos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (res.status === 200) return res.json();

  if (res.status === 400) {
    // Try to parse structured validation error from backend
    let parsed = null;
    try {
      parsed = await res.json();
    } catch {
      // fallback to text
    }

    const err = new Error('Dados inválidos');
    err.status = 400;

    if (parsed && Array.isArray(parsed.errors)) {
      const fieldMap = {};
      parsed.errors.forEach((it) => {
        const field = it.field || (it.arguments && it.arguments[0] && it.arguments[0].defaultMessage) || 'campo';
        const msg = it.defaultMessage || it.message || 'inválido';
        fieldMap[field] = fieldMap[field] || new Set();
        fieldMap[field].add(msg);
      });
      err.fieldErrors = Object.entries(fieldMap).map(([field, msgs]) => ({ field, messages: Array.from(msgs) }));
    } else if (parsed && parsed.message) {
      err.message = parsed.message;
    } else {
      try {
        const text = await res.text();
        if (text) err.message = text;
      } catch {
        // Mantém a mensagem padrão quando a resposta não possui texto.
      }
    }

    throw err;
  }

  if (res.status === 404) {
    const err = new Error('Endereço não encontrado');
    err.status = 404;
    throw err;
  }

  const err = new Error('Erro ao atualizar endereço');
  err.status = res.status;
  throw err;
}

export async function deleteEndereco(id) {
  const enderecoId = Number(id);
  if (!Number.isFinite(enderecoId)) {
    const err = new Error('ID do endereço inválido');
    err.status = 400;
    throw err;
  }

  const res = await fetch(`${BASE}/enderecos/${encodeURIComponent(enderecoId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 200 || res.status === 204) return true;

  let parsed = null;
  try {
    parsed = await res.json();
  } catch {
    // ignore non-JSON responses
  }

  if (res.status === 404) {
    const err = new Error(parsed?.mensagem || 'Endereço não encontrado');
    err.status = 404;
    throw err;
  }

  if (res.status === 409) {
    const erro = parsed?.erro || parsed || {};
    const err = new Error(erro?.mensagem || 'Não foi possível excluir o endereço.');
    err.status = 409;
    err.details = erro;
    err.pedidoIds = Array.isArray(erro?.pedidoIds) ? erro.pedidoIds : [];
    throw err;
  }

  if (res.status === 400) {
    const err = new Error(parsed?.mensagem || parsed?.numero || parsed?.logradouro || 'Dados inválidos');
    err.status = 400;
    throw err;
  }

  const err = new Error(parsed?.mensagem || parsed?.erro?.mensagem || 'Erro ao excluir endereço');
  err.status = res.status;
  throw err;
}

export async function inactivateCliente(id) {
  const res = await fetch(`${BASE}/clientes/${id}`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (res.status === 200) return true;
  const err = new Error('Erro ao inativar cliente');
  err.status = res.status;
  throw err;
}

export async function reactivateCliente(id) {
  const res = await fetch(`${BASE}/clientes/${id}/reativar`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (res.status === 200) return true;
  const err = new Error('Erro ao reativar cliente');
  err.status = res.status;
  throw err;
}
