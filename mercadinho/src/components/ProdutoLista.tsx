import type { Produto } from '../types';
import { ProdutoCard } from './ProdutoCard';
import './ProdutoLista.css';

interface ProdutoListaProps {
  produtos: Produto[];
  onAddToCart: (produto: Produto) => void;
  isAdmin: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
}

export function ProdutoLista({ produtos, onAddToCart, isAdmin, onEdit, onDelete }: ProdutoListaProps) {
   //console.log('ProdutoLista recebeu:', produtos);
  
  if (produtos.length === 0) {
    return (
      <div className="produto-lista-vazia">
        <p>📦 Nenhum produto encontrado</p>
        <p className="produto-lista-vazia-sub">Tente buscar por outro termo ou adicione produtos</p>
      </div>
    );
  }

  return (
    <div className="produto-lista">
      {produtos.map((produto) => (
        <ProdutoCard
          key={produto.id}
          produto={produto}
          onAddToCart={onAddToCart}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}