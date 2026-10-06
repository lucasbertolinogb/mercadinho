import { useState } from 'react';
import type { CustomerAccount } from './ClienteAuth';
import './Header.css';

interface HeaderProps {
  onCartClick: () => void;
  cartItemCount: number;
  onSearch: (query: string) => void;
  onHistoryClick: () => void;
  isAdmin: boolean;
  isCustomerLoggedIn: boolean;
  onAdminToggle: () => void;
  cliente: CustomerAccount | null;
  onCustomerClick: () => void;
}

export function Header({
  onCartClick,
  cartItemCount,
  onSearch,
  onHistoryClick,
  isAdmin,
  isCustomerLoggedIn,
  onAdminToggle,
  cliente,
  onCustomerClick,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo" onClick={() => window.location.reload()}>🛒 Mercadinho</h1>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        <div className="header-actions">
          <button className="history-btn" onClick={onHistoryClick}>
            🧾 Histórico
          </button>
          <button className="account-btn" onClick={onCustomerClick} disabled={isAdmin}>
            {cliente ? '👤 Minha conta' : '👤 Entrar'}
          </button>
          <button 
            className={`admin-btn ${isAdmin ? 'active' : ''}`}
            onClick={onAdminToggle}
            disabled={!isAdmin && isCustomerLoggedIn}
          >
            {isAdmin ? '👤 Admin' : '🔐 Login'}
          </button>
          
          <button className="cart-btn" onClick={onCartClick}>
            🛒 Carrinho
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}