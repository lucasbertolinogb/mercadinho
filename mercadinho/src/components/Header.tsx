import { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onCartClick: () => void;
  cartItemCount: number;
  onSearch: (query: string) => void;
  onHistoryClick: () => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
}

export function Header({ onCartClick, cartItemCount, onSearch, onHistoryClick, isAdmin, onAdminToggle }: HeaderProps) {
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
          <button 
            className={`admin-btn ${isAdmin ? 'active' : ''}`}
            onClick={onAdminToggle}
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