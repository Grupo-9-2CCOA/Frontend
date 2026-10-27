import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PedidosList from '../src/pages/PedidosList.jsx'

vi.mock('../src/services/pedidoService', () => ({
  listarPedidos: vi.fn(),
  listarPedidosPorData: vi.fn(),
  criarPedido: vi.fn(),
  cancelarPedido: vi.fn(),
  atualizarStatusPedido: vi.fn(),
  atualizarPedido: vi.fn(),
}))

import { listarPedidos, listarPedidosPorData } from '../src/services/pedidoService'

const pedido = (id, dia) => ({
  id,
  produto: `Produto ${id}`,
  descricao: 'desc',
  valor: 50,
  isAtivo: true,
  dataPedido: `2026-11-0${dia}T10:00:00`,
  pagamento: { id: 1, estado: 'Pago' },
  entrega: { id: 1, estado: 'Pendente' },
  cliente: { id: 1, nome: 'Cliente' },
  endereco: null,
})

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <PedidosList />
    </MemoryRouter>,
  )
}

describe('PedidosList pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza botões de paginação quando existem várias páginas', async () => {
    listarPedidos.mockResolvedValue({
      pedidos: [pedido(1, 1), pedido(2, 2)],
      paginaAtual: 0,
      totalPaginas: 2,
      totalElementos: 12,
      tamanhoPagina: 10,
    })

    renderizarPagina()

    expect(await screen.findAllByText(/Produto 1/).length).toBeGreaterThan(0)
    expect(await screen.findByText(/Página 1 de 2/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeTruthy()
  })

  it('carrega a próxima página ao clicar em Próxima', async () => {
    listarPedidos.mockResolvedValueOnce({
      pedidos: [pedido(1, 1), pedido(2, 2)],
      paginaAtual: 0,
      totalPaginas: 2,
      totalElementos: 12,
      tamanhoPagina: 10,
    }).mockResolvedValueOnce({
      pedidos: [pedido(3, 3), pedido(4, 4)],
      paginaAtual: 1,
      totalPaginas: 2,
      totalElementos: 12,
      tamanhoPagina: 10,
    })

    renderizarPagina()

    await screen.findAllByText(/Produto 1/)
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))

    await waitFor(() => {
      expect(listarPedidos).toHaveBeenLastCalledWith(1)
    })
    expect(await screen.findByText(/Produto 3/)).toBeTruthy()
  })

  it('não carrega página anterior na primeira página', async () => {
    listarPedidos.mockResolvedValue({
      pedidos: [pedido(1, 1), pedido(2, 2)],
      paginaAtual: 0,
      totalPaginas: 2,
      totalElementos: 12,
      tamanhoPagina: 10,
    })

    renderizarPagina()

    await screen.findAllByText(/Produto 1/)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  })
})
