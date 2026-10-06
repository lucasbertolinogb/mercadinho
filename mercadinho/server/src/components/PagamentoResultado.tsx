import { useEffect, useState } from 'react';
import './PagamentoResultado.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PagamentoResultadoProps {
  tipo: 'sucesso' | 'falhou' | 'pendente';
}

export function PagamentoResultado({ tipo }: PagamentoResultadoProps) {
  const [status, setStatus] = useState<string | null>(null);
  const paymentId = new URLSearchParams(window.location.search).get('payment_id');

  useEffect(() => {
    if (!paymentId) return;

    let attempts = 0;
    const loadStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/pagamento/${encodeURIComponent(paymentId)}`);
        if (response.ok) {
          const data = await response.json() as { status: string };
          setStatus(data.status);
        }
      } finally {
        attempts += 1;
      }
    };

    void loadStatus();
    const interval = window.setInterval(() => {
      if (attempts >= 5) {
        window.clearInterval(interval);
        return;
      }
      void loadStatus();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [paymentId]);

  const title = tipo === 'sucesso'
    ? 'Pagamento recebido'
    : tipo === 'falhou'
      ? 'Pagamento nao aprovado'
      : 'Pagamento pendente';

  const message = status === 'PAGO'
    ? 'Seu pedido foi confirmado pelo backend.'
    : status === 'FALHOU'
      ? 'O pagamento nao foi aprovado. O estoque reservado foi liberado.'
      : 'A tela do Mercado Pago e apenas um retorno visual. A confirmacao definitiva depende do webhook.';

  return (
    <main className="pagamento-resultado">
      <section className="pagamento-resultado-card">
        <p className="pagamento-resultado-status">{status || 'AGUARDANDO CONFIRMACAO'}</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <a href="/">Voltar para a loja</a>
      </section>
    </main>
  );
}