import { useEffect, useRef, useState } from 'react';
import { createCliente, updateCliente } from '../services/clienteService';

export default function NewClienteModal({ open, onClose, onCreated, onUpdated, mode = 'create', client = null }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      const nextNome = client?.nome || '';
      const nextCpf = client?.cpf || '';
      const nextTelefone = client?.telefone || '';
      setNome(nextNome);
      setCpf(nextCpf);
      setTelefone(nextTelefone);
      setError(null);
      setTimeout(() => ref.current?.querySelector('input[name=nome]')?.focus(), 10);
    }
  }, [open, client]);

  if (!open) return null;

  const isEdit = mode === 'edit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!nome.trim() || !cpf.trim() || !telefone.trim()) {
      setError('Preencha nome, CPF e telefone');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        cpf: cpf.trim().replace(/[^0-9]/g, ''),
        telefone: telefone.trim().replace(/[^0-9]/g, ''),
      };

      if (isEdit && client?.id) {
        const updated = await updateCliente(client.id, payload);
        onUpdated?.(updated);
      } else {
        const created = await createCliente(payload);
        onCreated?.(created);
      }
      onClose?.();
    } catch (e) {
      // keep full error object so UI can render fieldErrors when available
      setError(e || new Error(isEdit ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-container' ref={ref} role='dialog' aria-modal='true' aria-label={isEdit ? 'Editar cliente' : 'Novo Cliente'}>
        <button className='modal-close' aria-label='Fechar' onClick={onClose}>×</button>
        <h2 className='modal-title'>{isEdit ? 'Editar cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmit} className='modal-form'>
          <label>
            Nome:
            <input name='nome' placeholder={isEdit ? '' : 'Digite o nome completo'} value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>

          <label>
            CPF:
            <input name='cpf' placeholder={isEdit ? '' : '000.000.000-00'} value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </label>

          <label>
            Celular:
            <input name='telefone' placeholder={isEdit ? '' : '(00)00000-0000'} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </label>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button type='submit' className='btn-primary' disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>

          {error && (
            <div className='modal-error' role='alert' style={{ marginTop: 12 }}>
              {error.fieldErrors ? (
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {error.fieldErrors.map((f) => (
                    <li key={f.field}><strong>{f.field}:</strong> {f.messages.join('; ')}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>{error.message}</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
