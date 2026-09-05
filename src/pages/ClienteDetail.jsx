import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCliente } from '../services/clienteService';
import Sidebar from '../components/Sidebar';
import '../App.css';

function formatarCpf(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  return digitos.length === 11
    ? `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
    : valor || '-';
}

function formatarTelefone(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return valor || '-';
}

export default function ClienteDetail() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCliente(id);
        setCliente(data);
        setError(null);
      } catch (e) {
        if (e.status === 404) setError('Cliente não encontrado');
        else setError(e.message || 'Erro');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    // focus back button for accessibility when component mounts
    backRef.current?.focus();
  }, [loading]);

  if (loading) return (
    <div className='page-layout cliente-detail-page'>
      <Sidebar active='clientes' />
      <main className='cliente-detail-main' aria-busy='true' aria-live='polite'>
         <p className='clientes-status clientes-status-loading'>Carregando cliente...</p>
      </main>
    </div>
  );
  if (error) return (
    <div className='page-layout cliente-detail-page'>
      <Sidebar active='clientes' />
      <main className='cliente-detail-main'>
        <section className='cliente-detail-card' aria-label='Erro ao carregar cliente'>
          <p className='cliente-detail-error' role="alert">{error}</p>
          <button ref={backRef} className='btn-secondary' onClick={() => navigate(-1)} aria-label="Voltar">Voltar</button>
        </section>
      </main>
    </div>
  );

  return (
    <div className='page-layout cliente-detail-page'>
      <Sidebar active='clientes' />
      <main className='cliente-detail-main'>
        <header className='cliente-detail-header'>
          <div>
            <p className='cliente-detail-eyebrow'>Cadastro de cliente</p>
            <h1 id='cliente-detail-title'>Detalhe do cliente</h1>
          </div>
          <button ref={backRef} className='btn-secondary' onClick={() => navigate(-1)} aria-label="Voltar para clientes">Voltar</button>
        </header>
        <section className='cliente-detail-card' aria-labelledby='cliente-detail-name'>
          <h2 id='cliente-detail-name'>{cliente.nome}</h2>
          <div className='cliente-detail-grid'>
            <div><span>ID</span><strong>{cliente.id}</strong></div>
            <div><span>CPF</span><strong>{formatarCpf(cliente.cpf)}</strong></div>
            <div><span>Telefone</span><strong>{formatarTelefone(cliente.telefone)}</strong></div>
            <div><span>Status</span><strong>{cliente.ativo === false ? 'Inativo' : 'Ativo'}</strong></div>
          </div>
        </section>
      </main>
    </div>
  );
}
