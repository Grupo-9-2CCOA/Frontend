import { useEffect, useRef } from 'react';

export default function ConfirmModal({ open, title, message, onCancel, onConfirm, error, loading = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const elementoAnterior = document.activeElement;
    const btn = ref.current?.querySelector('button[data-confirm]');
    btn?.focus();

    return () => elementoAnterior?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const modal = ref.current;
    if (loading) {
      modal?.focus();
    } else {
      modal?.querySelector('button[data-confirm]')?.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const botoes = [...modal.querySelectorAll('button:not([disabled])')];
      if (botoes.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const primeiroBotao = botoes[0];
      const ultimoBotao = botoes[botoes.length - 1];
      if (event.shiftKey && document.activeElement === primeiroBotao) {
        event.preventDefault();
        ultimoBotao.focus();
      } else if (!event.shiftKey && document.activeElement === ultimoBotao) {
        event.preventDefault();
        primeiroBotao.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div className='modal-overlay' role='dialog' aria-modal='true' aria-label={title}>
      <div ref={ref} className='confirm-modal' tabIndex='-1' aria-busy={loading}>
        <button type='button' className='modal-close' aria-label='Fechar' onClick={onCancel} disabled={loading}>×</button>
        <h3 className='modal-title confirm-title'>{title}</h3>
        <p className='confirm-message'>{message}</p>

        {error && (
          <div className='modal-error' role='alert' style={{ marginTop: 12, marginBottom: 12 }}>
            <div>{typeof error === 'string' ? error : error.message}</div>
            {(() => {
              const pedidoIds = typeof error === 'string'
                ? []
                : Array.isArray(error.pedidoIds)
                  ? error.pedidoIds
                  : Array.isArray(error.details?.pedidoIds)
                    ? error.details.pedidoIds
                    : [];

              return pedidoIds.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  <strong>Pedidos bloqueadores:</strong> {pedidoIds.join(', ')}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <div className='confirm-actions'>
          <button type='button' className='btn-secondary' onClick={onCancel} aria-label='Cancelar' disabled={loading}>Cancelar</button>
          <button type='button' className='btn-primary' data-confirm onClick={onConfirm} aria-label='Confirmar' disabled={loading}>
            {loading ? 'Cancelando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
