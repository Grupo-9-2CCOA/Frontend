import assert from 'assert';
import { filterClientes } from '../src/utils/filterClientes.js';

const data = [
  { id: 1, nome: 'João Silva', telefone: '(11) 97234-5816' },
  { id: 2, nome: 'Pedro Martins', telefone: '(11) 98156-9043' },
  { id: 3, nome: 'Ana', telefone: '99999' }
];

// search by name
assert.deepStrictEqual(filterClientes(data, 'joão').map(c => c.id), [1]);
// case-insensitive
assert.deepStrictEqual(filterClientes(data, 'PEDRO').map(c => c.id), [2]);
// search by phone substring
assert.deepStrictEqual(filterClientes(data, '999').map(c => c.id), [3]);
// empty term returns all
assert.deepStrictEqual(filterClientes(data, '').length, 3);

console.log('All filter tests passed');
