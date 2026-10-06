import { useState } from 'react';
import './ClienteAuth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CustomerAccount {
  id: string;
  name: string | null;
  email: string;
}

interface ClienteAuthProps {
  cliente: CustomerAccount | null;
  previousAdminToken: string;
  onAuthenticated: (cliente: CustomerAccount, token: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export function ClienteAuth({ cliente, previousAdminToken, onAuthenticated, onLogout, onClose }: ClienteAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/clientes/${mode === 'register' ? 'cadastro' : 'login'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(previousAdminToken ? { Authorization: `Bearer ${previousAdminToken}` } : {}),
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => null) as {
        error?: string;
        token?: string;
        cliente?: CustomerAccount;
      } | null;

      if (!response.ok) {
        setError(data?.error || `A API respondeu com erro HTTP ${response.status}.`);
        return;
      }

      if (!data?.token || !data.cliente) {
        setError('A API retornou uma resposta inválida. Tente novamente.');
        return;
      }

      onAuthenticated(data.cliente, data.token);
    } catch {
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cliente-auth-overlay" onClick={onClose}>
      <section
        className="cliente-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-auth-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="cliente-auth-header">
          <h2 id="cliente-auth-title">{cliente ? 'Minha conta' : 'Acesse sua conta'}</h2>
          <button type="button" className="cliente-auth-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {cliente ? (
          <div className="cliente-account-content">
            <p className="cliente-account-name">{cliente.name || 'Cliente'}</p>
            <p className="cliente-account-email">{cliente.email}</p>
            <button type="button" className="cliente-auth-submit" onClick={onLogout}>Sair da conta</button>
          </div>
        ) : (
          <>
            <div className="cliente-auth-tabs" role="tablist" aria-label="Acesso à conta">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => { setMode('login'); setError(''); }}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
                onClick={() => { setMode('register'); setError(''); }}
              >
                Criar conta
              </button>
            </div>

            <form className="cliente-auth-form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="cliente-auth-field">
                  <label htmlFor="cliente-name">Nome</label>
                  <input
                    id="cliente-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>
              )}
              <div className="cliente-auth-field">
                <label htmlFor="cliente-email">E-mail</label>
                <input
                  id="cliente-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  maxLength={254}
                  required
                />
              </div>
              <div className="cliente-auth-field">
                <label htmlFor="cliente-password">Senha</label>
                <input
                  id="cliente-password"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  minLength={mode === 'register' ? 8 : 1}
                  maxLength={72}
                  required
                />
                {mode === 'register' && <small>Use pelo menos 8 caracteres.</small>}
              </div>
              {error && <p className="cliente-auth-error" role="alert">{error}</p>}
              <button type="submit" className="cliente-auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Aguarde...' : mode === 'register' ? 'Criar conta' : 'Entrar'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}