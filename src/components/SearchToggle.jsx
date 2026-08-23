import { useState } from 'react';

export default function SearchToggle({ onSearch }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <div className='search-toggle'>
      <button
        type='button'
        className='search-toggle-button'
        aria-label='Abrir busca'
        onClick={() => setOpen((s) => !s)}
        title='Buscar'
      >
        <span className='material-symbols-outlined'>search</span>
      </button>
      {open && (
        <input
          className='search-toggle-input'
          aria-label='Pesquisar clientes por nome ou telefone'
          placeholder='Pesquisar...'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
        />
      )}
    </div>
  );
}
