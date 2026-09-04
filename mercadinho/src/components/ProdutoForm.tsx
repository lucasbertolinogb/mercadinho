import { useState, useEffect } from 'react';
import type { Produto } from '../types';
import './ProdutoForm.css';

interface ProdutoFormProps {
  produto?: Produto | null;
  onSave: (produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProdutoForm({ produto, onSave, onCancel }: ProdutoFormProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState('');

  useEffect(() => {
    if (produto) {
      setNome(produto.nome);
      setDescricao(produto.descricao || '');
      setPreco(produto.preco.toString());
      setEstoque(produto.estoque.toString());
      setCategoria(produto.categoria || '');
      setImagem(produto.imagem || '');
    }
  }, [produto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNumerico = Number(preco.replace(',', '.'));
    const estoqueNumerico = Number(estoque);

    if (!Number.isFinite(precoNumerico) || precoNumerico < 0 || !Number.isInteger(estoqueNumerico) || estoqueNumerico < 0) {
      return;
    }

    onSave({
      nome,
      descricao: descricao || null,
      preco: precoNumerico,
      estoque: estoqueNumerico,
      imagem: imagem || null,
      categoria: categoria || null,
    });
  };

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{produto ? '✏️ Editar Produto' : '➕ Adicionar Produto'}</h2>
          <button className="form-fechar" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="produto-form">
          <div className="form-group">
            <label htmlFor="nome">Nome do Produto *</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Arroz"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Arroz branco tipo 1"
              rows={2}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preco">Preço (R$) *</label>
              <input
                id="preco"
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([,.][0-9]{1,2})?"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
                placeholder="0,00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="estoque">Estoque *</label>
              <input
                id="estoque"
                type="number"
                min="0"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                required
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="alimentos">Alimentos</option>
              <option value="bebidas">Bebidas</option>
              <option value="limpeza">Limpeza</option>
              <option value="higiene">Higiene</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="imagem">URL da imagem ou página do produto</label>
            <input
              id="imagem"
              type="url"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              placeholder="https://exemplo.com/produto"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              {produto ? 'Salvar Alterações' : 'Adicionar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}