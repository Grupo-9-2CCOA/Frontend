export function filterClientes(clientes = [], term = '') {
  const q = (term || '').trim().toLowerCase();
  if (!q) return clientes;
  return clientes.filter((c) => {
    const nome = (c.nome || '').toLowerCase();
    const telefone = (c.telefone || '').toLowerCase();
    return nome.includes(q) || telefone.includes(q);
  });
}
