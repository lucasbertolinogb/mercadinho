import { useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: (name: string, senha: string) => boolean | Promise<boolean>;
  onClose: () => void;
}

export function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [name, setName] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(name, senha);
    if (!success) {
      setError('Nome ou senha incorretos');
    }
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>🔐 Login Admin</h2>
          <button className="admin-fechar" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="admin-name">Nome de Usuário</label>
            <input
              id="admin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Digite seu nome"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-senha">Senha</label>
            <input
              id="admin-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Digite sua senha"
            />
          </div>
          
          {error && <p className="admin-error">{error}</p>}
          
          <button type="submit" className="admin-btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}