import './EcobazarBreadcrumb.css';
import { Link } from 'react-router-dom';

function HomeIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 9 7-6 7 6v8h-5v-5H8v5H3V9Z" /></svg>;
}

export default function EcobazarBreadcrumb() {
  return (
    <section className="eco-breadcrumb-banner" aria-label="Breadcrumb">
      <nav className="eco-breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop" className="eco-breadcrumb-home" aria-label="Shop"><HomeIcon /></Link>
        <span className="eco-breadcrumb-separator">›</span>
        <Link to="/login">Account</Link>
        <span className="eco-breadcrumb-separator">›</span>
        <span className="eco-breadcrumb-current" aria-current="page">Login</span>
      </nav>
    </section>
  );
}
