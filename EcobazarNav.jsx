import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './EcobazarNav.css';

function DownArrow() {
  return <svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1 5 5 5-5" /></svg>;
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5 4.8 4.7c-.8.5-.9 1.4-.7 2.2 1.5 5.7 7.3 11.5 13 13 .8.2 1.7.1 2.2-.7l1.2-2.2-4.2-3-2 2c-2.4-.9-5.1-3.6-6-6l2-2-3.3-4.5Z" /></svg>;
}

const links = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', dropdown: true },
  { label: 'Pages', href: '/login', dropdown: true },
  { label: 'Blog', href: '/shop#blog', dropdown: true },
];

export default function EcobazarNav({ phone = '(219) 555-0114' }) {
  const [menuOpen, setMenuOpen] = useState(false);
   return (
    <nav className="eco-menu" aria-label="Main navigation">
      <button
        className="eco-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span>{menuOpen ? '×' : '☰'}</span>
      </button>
      <div className={`eco-menu-links${menuOpen ? ' is-open' : ''}`}>
        {links.map(({ label, href, dropdown }) => (
          <NavLink
            key={label}
            to={href}
            end={href === '/'}
            className={({ isActive }) => isActive ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {label}{dropdown && <DownArrow />}
          </NavLink>
        ))}
            </div>
      <a className="eco-menu-phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
        <PhoneIcon />
        <span>{phone}</span>
      </a>
    </nav>
  );
}
