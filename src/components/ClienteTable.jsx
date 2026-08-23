export default function ClienteTable({ clientes = [], onDelete, onEdit, onOpenAddresses }) {
  return (
    <table className='clientes-table'>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Celular</th>
          <th>CPF</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((c) => (
          <tr key={c.id} className='cliente-row'>
            <td className='client-name-cell'>
              <span>{c.nome}</span>
            </td>
            <td>{c.telefone}</td>
            <td>{c.cpf}</td>
            <td className='client-actions'>
              <button
                type='button'
                className='action-button'
                aria-label={`Editar cliente ${c.nome}`}
                onClick={(event) => { event.stopPropagation(); onEdit?.(c); }}
              >
                <span className='material-symbols-outlined'>edit</span>
                <span>Editar</span>
              </button>

              <button
                type='button'
                className='action-button'
                aria-label={`Endereços do cliente ${c.nome}`}
                onClick={(event) => { event.stopPropagation(); onOpenAddresses?.(c); }}
              >
                <span className='material-symbols-outlined'>location_on</span>
                <span>Endereços</span>
              </button>

              <button
                type='button'
                className='action-button delete-action'
                aria-label={`Deletar cliente ${c.nome}`}
                onClick={(event) => { event.stopPropagation(); onDelete(c.id, c.nome); }}
              >
                <span className='material-symbols-outlined'>delete</span>
                <span>Deletar</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
