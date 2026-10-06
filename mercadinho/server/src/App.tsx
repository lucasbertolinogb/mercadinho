import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProdutoLista } from './components/ProdutoLista';
import { Carrinho } from './components/Carrinho';
import { ProdutoForm } from './components/ProdutoForm';
import { AdminLogin } from './components/AdminLogin';
import { Historico } from './components/Historico';
import { PagamentoResultado } from './components/PagamentoResultado';
import type { Produto, CarrinhoItem, PedidoHistorico } from './types';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ProdutoInput {
  nome: string;
  descricao: string | null;
  preco: number;
  imagem: string | null;
  estoque: number;
  categoria: string | null;
}

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinhoItens, setCarrinhoItens] = useState<CarrinhoItem[]>([]);
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isProdutoFormOpen, setIsProdutoFormOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin-token') || '');
  const [historico, setHistorico] = useState<PedidoHistorico[]>([]);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [isHistoricoLoading, setIsHistoricoLoading] = useState(false);

  useEffect(() => {
    const loadProdutos = async () => {
      try {
        const response = await fetch(`${API_URL}/produtos`);
        if (!response.ok) throw new Error('Não foi possível carregar os produtos');
        setProdutos(await response.json());
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProdutos();
  }, []);

  const loadHistorico = async () => {
    setIsHistoricoLoading(true);
    try {
      const response = await fetch(`${API_URL}/pedidos`);
      if (!response.ok) throw new Error('Não foi possível carregar o histórico');
      setHistorico(await response.json());
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsHistoricoLoading(false);
    }
  };

  const handleHistoryClick = () => {
    setIsHistoricoOpen(true);
    void loadHistorico();
  };

  // Filtrar produtos pela busca
  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Adicionar ao carrinho
  const handleAddToCart = (produto: Produto) => {
    const existingItem = carrinhoItens.find(item => item.produtoId === produto.id);
    const quantidadeAtual = existingItem?.quantidade || 0;
    if (quantidadeAtual >= produto.estoque) return;
    
    if (existingItem) {
      // Atualizar quantidade
      const updatedItens = carrinhoItens.map(item =>
        item.produtoId === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
      setCarrinhoItens(updatedItens);
    } else {
      // Adicionar novo item
      const newItem: CarrinhoItem = {
        id: crypto.randomUUID(),
        quantidade: 1,
        preco: produto.preco,
        produtoId: produto.id,
        carrinhoId: 'temp',
        produto: produto
      };
      setCarrinhoItens([...carrinhoItens, newItem]);
    }
    
  };

  // Remover item do carrinho
  const handleRemoveItem = (itemId: string) => {
    setCarrinhoItens(carrinhoItens.filter(i => i.id !== itemId));
  };

  // Atualizar quantidade
  const handleUpdateQuantity = (itemId: string, quantidade: number) => {
    if (quantidade < 1) return;
    
    const item = carrinhoItens.find(i => i.id === itemId);
    if (!item) return;
    
    const produto = produtos.find(current => current.id === item.produtoId);
    if (!produto || quantidade > produto.estoque) return;
    
    setCarrinhoItens(carrinhoItens.map(i =>
      i.id === itemId ? { ...i, quantidade } : i
    ));
    
  };

  // Salvar produto (criar ou editar)
  const handleSaveProduto = async (data: ProdutoInput) => {
    const url = produtoEditando
      ? `${API_URL}/produtos/${produtoEditando.id}`
      : `${API_URL}/produtos`;
    const response = await fetch(url, {
      method: produtoEditando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      alert('Não foi possível salvar o produto.');
      return;
    }

    const savedProduto = await response.json();
    setProdutos(current => produtoEditando
      ? current.map(produto => produto.id === savedProduto.id ? savedProduto : produto)
      : [savedProduto, ...current]);
    setIsProdutoFormOpen(false);
    setProdutoEditando(null);
  };

  // Excluir produto
  const handleDeleteProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const response = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!response.ok) {
      alert('Não foi possível excluir o produto.');
      return;
    }
    setProdutos(current => current.filter(produto => produto.id !== id));
  };

  // Login admin
  const handleAdminLogin = async (name: string, senha: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, senha }),
    });
    if (!response.ok) return false;

    const { token } = await response.json();
    sessionStorage.setItem('admin-token', token);
    setAdminToken(token);
    setIsAdmin(true);
    setIsAdminLoginOpen(false);
    return true;
  };

  // Finalizar compra
  const handleCheckout = async () => {
    if (carrinhoItens.length === 0) return;

    const response = await fetch(`${API_URL}/pagamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itens: carrinhoItens.map(item => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as { error?: string } | null;
      alert(errorData?.error || 'Não foi possível iniciar o pagamento.');
      return;
    }

    const { init_point: initPoint } = await response.json() as { init_point?: string };
    if (!initPoint) {
      alert('O Mercado Pago nÃ£o retornou uma URL de checkout.');
      return;
    }
    window.location.href = initPoint;
  };

  // Abrir formulário de edição
  const handleEdit = (produto: Produto) => {
    setProdutoEditando(produto);
    setIsProdutoFormOpen(true);
  };

  const paymentPath = window.location.pathname;
  if (paymentPath === '/pagamento/sucesso' || paymentPath === '/pagamento/falhou' || paymentPath === '/pagamento/pendente') {
    return <PagamentoResultado tipo={paymentPath.split('/').pop() as 'sucesso' | 'falhou' | 'pendente'} />;
  }

  return (
    <div className="app">
      <Header
        onCartClick={() => setIsCarrinhoOpen(true)}
        cartItemCount={carrinhoItens.reduce((acc, item) => acc + item.quantidade, 0)}
        onSearch={setSearchQuery}
        onHistoryClick={handleHistoryClick}
        isAdmin={isAdmin}
        onAdminToggle={() => isAdmin ? setIsAdmin(false) : setIsAdminLoginOpen(true)}
      />
      
      <main className="main">
        {isAdmin && (
          <div className="admin-bar">
            <span>🔧 Modo Administrador</span>
            <button 
              className="btn-adicionar"
              onClick={() => {
                setProdutoEditando(null);
                setIsProdutoFormOpen(true);
              }}
            >
              ➕ Adicionar Produto
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">Carregando produtos...</div>
        ) : (
          <ProdutoLista
            produtos={produtosFiltrados}
            onAddToCart={handleAddToCart}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDeleteProduto}
          />
        )}
      </main>
      
      <Carrinho
        itens={carrinhoItens}
        isOpen={isCarrinhoOpen}
        onClose={() => setIsCarrinhoOpen(false)}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />

      <Historico
        pedidos={historico}
        isOpen={isHistoricoOpen}
        isLoading={isHistoricoLoading}
        onClose={() => setIsHistoricoOpen(false)}
      />
      
      {isProdutoFormOpen && (
        <ProdutoForm
          produto={produtoEditando}
          onSave={handleSaveProduto}
          onCancel={() => {
            setIsProdutoFormOpen(false);
            setProdutoEditando(null);
          }}
        />
      )}
      
      {isAdminLoginOpen && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}
    </div>
  );
}