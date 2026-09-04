import type { CarrinhoItem } from '../types';
import './Carrinho.css';

interface CarrinhoProps {
  itens: CarrinhoItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantidade: number) => void;
  onCheckout: () => void;
}

export function Carrinho({ itens, isOpen, onClose, onRemoveItem, onUpdateQuantity, onCheckout }: CarrinhoProps) {
  const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  
  const formatPrice = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  if (!isOpen) return null;

  return (
    <div className="carrinho-overlay" onClick={onClose}>
      <div className="carrinho-modal" onClick={(e) => e.stopPropagation()}>
        <div className="carrinho-header">
          <h2>🛒 Meu Carrinho</h2>
          <button className="carrinho-fechar" onClick={onClose}>✕</button>
        </div>
        
        <div className="carrinho-itens">
          {itens.length === 0 ? (
            <div className="carrinho-vazio">
              <p>Seu carrinho está vazio</p>
              <p className="carrinho-vazio-sub">Adicione produtos para começar</p>
            </div>
          ) : (
            itens.map((item) => (
              <div key={item.id} className="carrinho-item">
                <div className="carrinho-item-info">
                  <h4>{item.produto.nome}</h4>
                  <p className="carrinho-item-preco">{formatPrice(item.preco)}</p>
                </div>
                
                <div className="carrinho-item-quantidade">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}
                    disabled={item.quantidade <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantidade}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}
                  >
                    +
                  </button>
                </div>
                
                <div className="carrinho-item-total">
                  {formatPrice(item.preco * item.quantidade)}
                </div>
                
                <button 
                  className="carrinho-item-remover"
                  onClick={() => onRemoveItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
        
        {itens.length > 0 && (
          <div className="carrinho-footer">
            <div className="carrinho-total">
              <span>Total:</span>
              <span className="carrinho-total-valor">{formatPrice(total)}</span>
            </div>
            <button className="carrinho-checkout" onClick={onCheckout}>
              💳 Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}