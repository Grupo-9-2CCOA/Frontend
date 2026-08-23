import { useEffect, useRef } from 'react';

export default function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      const btn = ref.current?.querySelector('button[data-confirm]');
      btn?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className='modal-overlay' role='dialog' aria-modal='true' aria-label={title}>
      <div ref={ref} className='confirm-modal'>
        <button type='button' className='modal-close' aria-label='Fechar' onClick={onCancel}>×</button>
        <h3 className='modal-title confirm-title'>{title}</h3>
        <p className='confirm-message'>{message}</p>
        <div className='confirm-actions'>
          <button type='button' className='btn-secondary' onClick={onCancel} aria-label='Cancelar'>Cancelar</button>
          <button type='button' className='btn-primary' data-confirm onClick={onConfirm} aria-label='Confirmar'>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
