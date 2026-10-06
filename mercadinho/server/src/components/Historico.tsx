import type { PedidoHistorico } from '../types';
import './Historico.css';

interface HistoricoProps {
  pedidos: PedidoHistorico[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export function Historico({ pedidos, isOpen, isLoading, onClose }: HistoricoProps) {
  const formatPrice = (valor: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

  const formatDate = (data: string) => new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(data));

  if (!isOpen) return null;

  return (
    <div className="historico-overlay" onClick={onClose}>
      <div className="historico-modal" onClick={(event) => event.stopPropagation()}>
        <div className="historico-header">
          <h2>🧾 Histórico de compras</h2>
          <button className="historico-fechar" onClick={onClose}>✕</button>
        </div>

        <div className="historico-conteudo">
          {isLoading ? (
            <p className="historico-vazio">Carregando histórico...</p>
          ) : pedidos.length === 0 ? (
            <p className="historico-vazio">Nenhuma compra realizada ainda.</p>
          ) : (
            pedidos.map((pedido) => (
              <article className="historico-pedido" key={pedido.id}>
                <div className="historico-pedido-topo">
                  <div>
                    <strong>Pedido #{pedido.id.slice(0, 8)}</strong>
                    <time>{formatDate(pedido.data)}</time>
                  </div>
                  <strong className="historico-valor">{formatPrice(pedido.valor)}</strong>
                </div>
                <ul>
                  {pedido.itens.map((item) => (
                    <li key={`${pedido.id}-${item.produtoId}`}>
                      {item.quantidade}x {item.produto?.nome || 'Produto removido'}
                    </li>
                  ))}
                </ul>
                <span className="historico-status">{pedido.status}</span>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
