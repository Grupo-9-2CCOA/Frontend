export default function ClienteTable({ clientes = [], onDelete, onEdit, onOpenAddresses, onActivate, showingInactive = false }) {
  return (
    <table className='clientes-table'>
      <thead>
        <tr>
          <th scope='col'>Nome</th>
          <th scope='col'>Celular</th>
          <th scope='col'>CPF</th>
          <th scope='col'>Ações</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((c) => (
          <tr key={c.id} className='cliente-row'>
            <td className='client-name-cell' data-label='Nome'>
              <span>{c.nome}</span>
            </td>
            <td data-label='Celular'>{c.telefone}</td>
            <td data-label='CPF'>{c.cpf}</td>
            <td className='client-actions' data-label='Ações'>
              {showingInactive ? (
                <button
                  type='button'
                  className='action-button'
                  aria-label={`Reativar cliente ${c.nome}`}
                  onClick={() => onActivate?.(c.id)}
                >
                  <span className='material-symbols-outlined'>person_check</span>
                  <span>Reativar</span>
                </button>
              ) : (
                <>
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
                    aria-label={`Inativar cliente ${c.nome}`}
                    onClick={(event) => { event.stopPropagation(); onDelete(c.id, c.nome); }}
                  >
                    <span className='material-symbols-outlined'>person_off</span>
                    <span>Inativar</span>
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
