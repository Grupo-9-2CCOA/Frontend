import { useCallback, useEffect, useRef, useState } from 'react';
import { listClientes, listClientesInativos, inactivateCliente, reactivateCliente } from '../services/clienteService';
import Sidebar from '../components/Sidebar';
import ClienteTable from '../components/ClienteTable';
import SearchToggle from '../components/SearchToggle';
import ConfirmModal from '../components/ConfirmModal';
import NewClienteModal from '../components/NewClienteModal';
import EnderecosModal from '../components/EnderecosModal';
import { filterClientes } from '../utils/filterClientes';
import '../App.css';

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [showingInactive, setShowingInactive] = useState(false);
  const requestId = useRef(0);

  const fetchList = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = showingInactive ? await listClientesInativos() : await listClientes();
      if (currentRequest !== requestId.current) return;
      setClientes(data);
    } catch (e) {
      if (currentRequest !== requestId.current) return;
      setError(e.message || 'Erro ao carregar');
      setClientes([]);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [showingInactive]);

  useEffect(() => {
    // A consulta inicial controla os estados de loading, sucesso e erro.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList();
    return () => {
      requestId.current += 1;
    };
  }, [fetchList]);

  const handleSearch = (term) => setSearchTerm(term || '');

  const handleDelete = (id, nome) => {
    setToDelete({ id, nome });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await inactivateCliente(toDelete.id);
      setClientes((prev) => prev.filter((c) => c.id !== toDelete.id));
    } catch (e) {
      alert(e.message || 'Erro ao inativar (400)');
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const clearSearch = () => setSearchTerm('');

  const toggleInactive = () => {
    setShowingInactive((currentMode) => !currentMode);
    setSearchTerm('');
  };

  const handleActivate = async (id) => {
    try {
      await reactivateCliente(id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (e) {
      setError(e.message || 'Erro ao reativar cliente');
    }
  };

  const shown = filterClientes(clientes, searchTerm);

  const [newOpen, setNewOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingClient, setEditingClient] = useState(null);
  const [enderecosOpen, setEnderecosOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const openCreateModal = () => {
    setEditingClient(null);
    setModalMode('create');
    setNewOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setModalMode('edit');
    setNewOpen(true);
  };

  const openEnderecosModal = (client) => {
    setSelectedCliente(client);
    setEnderecosOpen(true);
  };

  const handleNewCreated = (created) => {
    setClientes((prev) => [created, ...prev]);
  };

  const handleUpdated = (updated) => {
    setClientes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <div className='page-layout clientes-page'>
      <Sidebar active='clientes' />

      <main className='clientes-main'>
        <div className='clientes-header'>
          <h1 className='page-title clientes-title'>{showingInactive ? 'Clientes Inativos' : 'Gerenciamento de Clientes'}</h1>
          <div className='clientes-header-actions'>
            <button type='button' className='btn-link' onClick={toggleInactive} disabled={loading}>
              {showingInactive ? 'Ver clientes ativos' : 'Ver clientes inativos'}
            </button>
            {!showingInactive && <button type='button' className='btn-primary' onClick={openCreateModal}>+ Novo Cliente</button>}
          </div>
        </div>

        <div className='clientes-panel' aria-busy={loading}>
          <div className='clientes-toolbar'>
            <div className='clientes-toolbar-spacer' />
            <SearchToggle onSearch={handleSearch} />
          </div>

          {loading && <p className='clientes-status clientes-status-loading'>Carregando...</p>}
          {error && <p className='clientes-status' role='alert'>{error}</p>}

          {!loading && !error && shown.length === 0 && (
            <div className='clientes-empty'>
              <p>{showingInactive ? 'Nenhum cliente inativo encontrado.' : 'Nenhum cliente encontrado.'}</p>
              {searchTerm ? (
                <button type='button' className='btn-link' onClick={clearSearch}>Limpar busca</button>
              ) : (
                !showingInactive && <button type='button' className='btn-link' onClick={openCreateModal}>Cadastrar cliente</button>
              )}
            </div>
          )}

          {!loading && !error && shown.length > 0 && (
            <ClienteTable
              clientes={shown}
              onDelete={handleDelete}
              onEdit={openEditModal}
              onOpenAddresses={openEnderecosModal}
              onActivate={handleActivate}
              showingInactive={showingInactive}
            />
          )}
        </div>

        <ConfirmModal
          open={confirmOpen}
          title='Confirmar inativação'
          message={toDelete ? `Deseja inativar o cliente ${toDelete.nome}?` : ''}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
        />

        <NewClienteModal
          open={newOpen}
          mode={modalMode}
          client={editingClient}
          onClose={() => {
            setNewOpen(false);
            setEditingClient(null);
            setModalMode('create');
          }}
          onCreated={handleNewCreated}
          onUpdated={handleUpdated}
        />

        <EnderecosModal
          open={enderecosOpen}
          cliente={selectedCliente}
          onClose={() => {
            setEnderecosOpen(false);
            setSelectedCliente(null);
          }}
        />
      </main>
    </div>
  );
}
