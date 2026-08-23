import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCliente } from '../services/clienteService';

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

  if (loading) return <p>Carregando...</p>;
  if (error) return (
    <div>
      <p role="alert">{error}</p>
      <button ref={backRef} onClick={() => navigate(-1)} aria-label="Voltar">Voltar</button>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Detalhe do Cliente</h1>
      <p><strong>ID:</strong> {cliente.id}</p>
      <p><strong>Nome:</strong> {cliente.nome}</p>
      <p><strong>CPF:</strong> {cliente.cpf}</p>
      <p><strong>Telefone:</strong> {cliente.telefone}</p>
      <p><strong>Ativo:</strong> {cliente.ativo === false ? 'false' : 'true'}</p>
      <button ref={backRef} onClick={() => navigate(-1)} aria-label="Voltar">Voltar</button>
    </div>
  );
}
