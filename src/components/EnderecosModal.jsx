import { useEffect, useState } from 'react';
import { listEnderecosPorCliente, deleteEndereco } from '../services/clienteService';
import NovoEnderecoModal from './NovoEnderecoModal';
import EditEnderecoModal from './EditEnderecoModal';
import ConfirmModal from './ConfirmModal';

export default function EnderecosModal({ open, cliente, onClose }) {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEndereco, setEditingEndereco] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const extractId = (en) => {
    if (!en) return undefined;
    const candidates = [en.id, en.enderecoId, en.idEndereco, en.codigo, en._id];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') return Number(c);
    }
    return undefined;
  };

  useEffect(() => {
    const load = async () => {
      if (!open || !cliente?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await listEnderecosPorCliente(cliente.id);
        setEnderecos(data || []);
      } catch (e) {
        setError(e.message || 'Erro ao carregar endereços');
        setEnderecos([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, cliente?.id]);

  const handleCreated = (created) => {
    setEnderecos((prev) => [created, ...prev]);
  };

  const handleDeleteRequest = (endereco) => {
    setDeleteError(null);
    setToDelete(endereco);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);

    try {
      await deleteEndereco(extractId(toDelete));
      setEnderecos((prev) => prev.filter((e) => extractId(e) !== extractId(toDelete)));
      setConfirmOpen(false);
      setToDelete(null);
    } catch (e) {
      setDeleteError({
        message: e.message || 'Erro ao excluir endereço',
        pedidoIds: Array.isArray(e.pedidoIds) ? e.pedidoIds : [],
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <div className='modal-overlay'>
        <div className='enderecos-modal' role='dialog' aria-modal='true' aria-label={`Endereços do cliente ${cliente?.nome || ''}`}>
          <div className='enderecos-topbar'>
            <h2 className='modal-title enderecos-title'>Endereços</h2>
            <div className='enderecos-top-actions'>
              <button type='button' className='btn-primary btn-small' onClick={() => setNovoOpen(true)}>
                Novo endereço
              </button>
              <button type='button' className='modal-close' aria-label='Fechar modal de endereços' onClick={onClose}>×</button>
            </div>
          </div>

          <div className='enderecos-table-wrap'>
            {loading && <p className='modal-status'>Carregando endereços...</p>}
            {!loading && error && <p className='modal-status modal-error'>{error}</p>}

            {!loading && !error && enderecos.length === 0 && (
              <div className='enderecos-empty'>
                <p>Nenhum endereço cadastrado.</p>
              </div>
            )}

            {!loading && !error && enderecos.length > 0 && (
              <table className='enderecos-table'>
                <thead>
                  <tr>
                    <th>Logradouro</th>
                    <th>Número</th>
                    <th>Complemento</th>
                    <th>CEP</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {enderecos.map((endereco, index) => (
                    <tr key={(extractId(endereco) !== undefined ? extractId(endereco) : `${endereco.cep}-${index}`)}>
                      <td>{endereco.logradouro}</td>
                      <td>{endereco.numero}</td>
                      <td>{endereco.complemento || '-'}</td>
                      <td>{endereco.cep}</td>
                      <td className='enderecos-actions'>
                        <button
                          type='button'
                          className='action-button'
                          aria-label={`Editar endereço ${endereco.logradouro}`}
                          onClick={() => {
                            setEditingEndereco(endereco);
                            setEditOpen(true);
                          }}
                        >
                          <span className='material-symbols-outlined'>edit</span>
                          <span>Editar</span>
                        </button>
                        <button
                          type='button'
                          className='action-button delete-action'
                          aria-label={`Deletar endereço ${endereco.logradouro}`}
                          onClick={() => handleDeleteRequest(endereco)}
                        >
                          <span className='material-symbols-outlined'>delete</span>
                          <span>Deletar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <NovoEnderecoModal
        open={novoOpen}
        clienteId={cliente?.id}
        onClose={() => setNovoOpen(false)}
        onCreated={(created) => {
          handleCreated(created);
          setNovoOpen(false);
        }}
      />

      <EditEnderecoModal
        open={editOpen}
        endereco={editingEndereco}
        onClose={() => {
          setEditOpen(false);
          setEditingEndereco(null);
        }}
        onUpdated={(updated) => {
          const updatedId = extractId(updated);
          setEnderecos((prev) => prev.map((e) => (extractId(e) === updatedId ? updated : e)));
          setEditOpen(false);
          setEditingEndereco(null);
        }}
      />

      <ConfirmModal
        open={confirmOpen}
        title='Confirmar deleção'
        message={toDelete ? `Deseja prosseguir com a exclusão do endereço ${toDelete.logradouro}?` : ''}
        error={deleteError}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
