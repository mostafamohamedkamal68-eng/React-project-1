import './EcobazarHeader.css';
import { useNavigate } from 'react-router-dom';

function LeafLogo() {
  return (
    <svg className="eco-leaf" viewBox="0 0 32 28" aria-hidden="true">
      <path d="M14.8 13.4C11.5 4.1 5.4 2.5 1.1 3.2c-.4 7.2 2.3 12.4 10.5 13.1 1.3.1 2.2-.7 3.2-2.9Z" fill="currentColor" />
      <path d="M17.1 12.5C18.5 4.5 24.2 1.2 31 1.6c-.2 7.2-3.4 12.2-11.4 13.7-1.6.3-2.5-.7-2.5-2.8Z" fill="currentColor" />
      <path d="M15.9 12.1v14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2"/><path d="m15.3 15.3 4.1 4.1"/></svg>;
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 8.7c0 4.2-8.4 10.2-8.4 10.2S3.6 12.9 3.6 8.7a4.4 4.4 0 0 1 8.4-1.8 4.4 4.4 0 0 1 8.4 1.8Z"/></svg>;
}
function BasketIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.4 9.2 1.4 10.2h14.4l1.4-10.2H3.4Z"/><path d="m8.2 9.2 3.8-6 3.8 6"/></svg>;
}

export default function EcobazarHeader({
  cartTotal = '$0.00',
  cartCount = 0,
  favoritesCount = 0,
  favoritesActive = false,
  isAuthenticated = false,
  userName = '',
  onSearch,
  onFavoritesClick,
  onCartClick,
  onLogout,
}) {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('query')?.toString().trim();
    onSearch?.(query ?? '');
  }

  async function handleLogout() {
    try {
      await onLogout?.();
    } catch {
      // Clear the local session and return to login even if the server is unavailable.
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="eco-header" id="home">
      <a className="eco-brand" href="#home" aria-label="Ecobazar home">
        <LeafLogo />
        <span>Ecobazar</span>
      </a>

      <form className="eco-search" onSubmit={handleSubmit} role="search">
        <label className="eco-search-field">
          <SearchIcon />
          <input name="query" type="search" placeholder="Search" aria-label="Search products" />
            </label>
        <button type="submit">Search</button>
      </form>

      <div className="eco-actions">
        {isAuthenticated && <>
          {userName && <span className="eco-user-name">{userName}</span>}
          <button className="eco-logout" type="button" onClick={handleLogout}>Log out</button>
        </>}
        <button
          className={`eco-icon-button${favoritesActive ? ' is-active' : ''}`}
          type="button"
          aria-label={`Show favorites${favoritesCount ? `, ${favoritesCount} items` : ''}`}
          aria-pressed={favoritesActive}
          onClick={onFavoritesClick}
        >
          <HeartIcon />
          {favoritesCount > 0 && <span className="eco-cart-count">{favoritesCount}</span>}
        </button>
        <span className="eco-divider" aria-hidden="true" />
        <button className="eco-cart" type="button" aria-label={`Shopping cart, ${cartCount} items, ${cartTotal}`} onClick={onCartClick}>
          <span className="eco-basket-wrap"><BasketIcon />{cartCount > 0 && <span className="eco-cart-count">{cartCount}</span>}</span>
          <span className="eco-cart-copy"><small>Shopping cart:</small><strong>{cartTotal}</strong></span>
        </button>
      </div>
    </header>
  );
}
