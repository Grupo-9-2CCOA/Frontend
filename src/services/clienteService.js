const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export async function listClientes() {
  const res = await fetch(`${BASE}/clientes`);
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`Erro ao listar clientes: ${res.status}`);
  return res.json();
}

export async function getCliente(id) {
  const res = await fetch(`${BASE}/clientes/${id}`);
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

export async function listEnderecosPorCliente(clienteId) {
  const res = await fetch(`${BASE}/enderecos/${clienteId}`);
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`Erro ao listar endereços: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return data;
  return data.map(_normalizeEndereco);
}

export async function createEndereco(clienteId, payload) {
  const res = await fetch(`${BASE}/enderecos/${clienteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    } catch (_e) {
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
      } catch (_e) {}
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
    body: JSON.stringify(payload),
  });

  if (res.status === 200) return res.json();

  if (res.status === 400) {
    // Try to parse structured validation error from backend
    let parsed = null;
    try {
      parsed = await res.json();
    } catch (_e) {
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
      } catch (_e) {}
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

  const res = await fetch(`${BASE}/enderecos/${encodeURIComponent(enderecoId)}`, { method: 'DELETE' });
  if (res.status === 200 || res.status === 204) return true;
  if (res.status === 404) {
    const err = new Error('Endereço não encontrado');
    err.status = 404;
    throw err;
  }
  const err = new Error('Erro ao excluir endereço');
  err.status = res.status;
  throw err;
}

export async function inactivateCliente(id) {
  const res = await fetch(`${BASE}/clientes/${id}`, { method: 'PATCH' });
  if (res.status === 200) return true;
  const err = new Error('Erro ao inativar cliente');
  err.status = res.status;
  throw err;
}
