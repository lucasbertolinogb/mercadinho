export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem: string | null;
  estoque: number;
  categoria: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarrinhoItem {
  id: string;
  quantidade: number;
  preco: number;
  produtoId: string;
  carrinhoId: string;
  produto: Produto;
}

export interface Carrinho {
  id: string;
  clienteId: string;
  itens: CarrinhoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  email: string;
  name: string | null;
  cartao: Cartao | null;
  carrinho: Carrinho[];
}

export interface Cartao {
  id: string;
  name: string;
  numero: string;
  validade: string;
  cvv: string;
  clienteId: string;
}

export interface Transacao {
  id: string;
  valor: number;
  data: Date;
  clienteId: string;
  status: string;
  itens: string;
}

export interface PedidoHistorico {
  id: string;
  valor: number;
  data: string;
  status: string;
  itens: Array<{
    produtoId: string;
    quantidade: number;
    produto: Pick<Produto, 'nome'> | null;
  }>;
}

export interface Empregado {
  id: string;
  name: string;
  senha: string;
  createdAt: Date;
}