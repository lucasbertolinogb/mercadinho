import type { Produto } from '../types';
import './ProdutoCard.css';
import { useState } from 'react';

interface ProdutoCardProps {
  produto: Produto;
  onAddToCart: (produto: Produto) => void;
  isAdmin: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
}

export function ProdutoCard({ produto, onAddToCart, isAdmin, onEdit, onDelete }: ProdutoCardProps) {

  //console.log('Produto:', produto);
  //console.log('URL da imagem:', produto.imagem);

  //console.error('========== PRODUTO CARD ==========');
  //console.error('PRODUTO:', produto);
  //console.error('IMAGEM:', produto.imagem);


  const [imagemComErro, setImagemComErro] = useState(false);
  const formatPrice = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  return (
    <div className="produto-card">
      <div className="produto-imagem">
        {produto.imagem && !imagemComErro && (
          <img
            src={produto.imagem}
            alt={produto.nome}
            onError={() => setImagemComErro(true)}
          />
        )}
        {(!produto.imagem || imagemComErro) && (
          <div className="produto-sem-imagem">📦</div>
        )}
      </div>
      
      <div className="produto-info">
        <h3 className="produto-nome">{produto.nome}</h3>
        {produto.descricao && (
          <p className="produto-descricao">{produto.descricao}</p>
        )}
        <p className="produto-preco">{formatPrice(produto.preco)}</p>
        <p className={`produto-estoque ${produto.estoque === 0 ? 'esgotado' : ''}`}>
          {produto.estoque === 0 ? '❌ Esgotado' : `📦 ${produto.estoque} em estoque`}
        </p>
        
        <div className="produto-acoes">
          {isAdmin ? (
            <>
              <button 
                className="btn-editar"
                onClick={() => onEdit(produto)}
              >
                ✏️ Editar
              </button>
              <button 
                className="btn-excluir"
                onClick={() => onDelete(produto.id)}
              >
                🗑️ Excluir
              </button>
            </>
          ) : (
            <button 
              className="btn-comprar"
              onClick={() => onAddToCart(produto)}
              disabled={produto.estoque === 0}
            >
              {produto.estoque === 0 ? 'Indisponível' : '🛒 Adicionar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}