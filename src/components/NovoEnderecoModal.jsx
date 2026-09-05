import { useEffect, useRef, useState } from 'react';
import { createEndereco } from '../services/clienteService';

export default function NovoEnderecoModal({ open, clienteId, onClose, onCreated }) {
  const ref = useRef(null);
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      // Limpa o formulário sempre que um novo cadastro é iniciado.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogradouro('');
      setNumero('');
      setCep('');
      setComplemento('');
      setError(null);
      setTimeout(() => ref.current?.querySelector('input[name=logradouro]')?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validação de campos obrigatórios e regras específicas
    const fieldErrors = [];

    if (!logradouro.trim()) fieldErrors.push({ field: 'logradouro', messages: ['O campo Logradouro é obrigatório.'] });
    if (!numero.trim()) fieldErrors.push({ field: 'numero', messages: ['O campo Número é obrigatório.'] });
    if (!cep.trim()) fieldErrors.push({ field: 'cep', messages: ['O campo CEP é obrigatório.'] });

    // validações adicionais quando preenchidos
    const numeroTrim = numero.trim();
    if (numeroTrim && !/^[0-9]+$/.test(numeroTrim)) {
      fieldErrors.push({ field: 'numero', messages: ['Número deve conter apenas dígitos.'] });
    }

    // CEP: apenas dígitos e exatamente 8 caracteres
    const cepDigits = cep.trim().replace(/[^0-9]/g, '');
    if (cep.trim() && cepDigits.length !== 8) {
      fieldErrors.push({ field: 'cep', messages: ['CEP deve conter exatamente 8 dígitos.'] });
    }

    if (fieldErrors.length > 0) {
      setError({ fieldErrors });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        logradouro: logradouro.trim(),
        numero: numeroTrim,
        cep: cepDigits,
        complemento: complemento.trim(),
      };

      const created = await createEndereco(clienteId, payload);
      onCreated?.(created);
      onClose?.();
    } catch (e) {
      // keep full error object to render fieldErrors if present
      setError(e || new Error('Erro ao criar endereço'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-container endereco-modal-container' ref={ref} role='dialog' aria-modal='true' aria-label='Novo endereço'>
        <button type='button' className='modal-close' aria-label='Fechar modal de endereço' onClick={onClose}>×</button>
        <h2 className='modal-title'>Novo endereço</h2>

        <form className='modal-form' onSubmit={handleSubmit}>
          <label>
            Logradouro:
            <input name='logradouro' value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
          </label>

          <label>
            Número:
            <input name='numero' value={numero} onChange={(e) => setNumero(e.target.value)} />
          </label>

          <label>
            CEP:
            <input name='cep' value={cep} onChange={(e) => setCep(e.target.value)} />
          </label>

          <label>
            Complemento (opcional):
            <input name='complemento' value={complemento} onChange={(e) => setComplemento(e.target.value)} />
          </label>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button type='submit' className='btn-primary' disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>

          {error && (
            <div className='modal-error' role='alert' style={{ marginTop: 12 }}>
              {error.fieldErrors ? (
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {(() => {
                    const labels = { logradouro: 'Logradouro', numero: 'Número', cep: 'CEP', complemento: 'Complemento' };
                    return error.fieldErrors.map((f) => (
                      <li key={f.field}><strong>{labels[f.field] || f.field}:</strong> {f.messages.join(' ')}</li>
                    ));
                  })()}
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
