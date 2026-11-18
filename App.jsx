import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './componant 2/Router/AppRoutes';
import { useCartStore } from './store/useCartStore';

const STRAPI_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
let sessionRefreshRequest;

async function requestStrapi(path, options = {}) {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
   const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || `Strapi request failed (${response.status})`);
  }

  return data;
}

function refreshSession() {
  if (!sessionRefreshRequest) {
    sessionRefreshRequest = requestStrapi('/api/auth/refresh', {
      method: 'POST',
      headers: { 'x-strapi-refresh-cookie': 'httpOnly' },
      body: '{}',
    });
  }
    return sessionRefreshRequest;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const resetCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    let mounted = true;
	   refreshSession()
      .then(data => {
        if (mounted && data.jwt) setAuthToken(data.jwt);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });
    return () => { mounted = false; };
  }, []);

    async function login({ email, password }) {
    const data = await requestStrapi('/api/auth/local', {
      method: 'POST',
      headers: { 'x-strapi-refresh-cookie': 'httpOnly' },
      body: JSON.stringify({ identifier: email, password }),
    });
    if (!data.jwt) throw new Error('لم يُرجع Strapi رمز تسجيل الدخول.');
    setAuthToken(data.jwt);
    setUser(data.user || null);
  }

  async function logout() {
    try {
      if (authToken) {
        await requestStrapi('/api/auth/logout', {
          method: 'POST',
		        headers: {
            Authorization: `Bearer ${authToken}`,
            'x-strapi-refresh-cookie': 'httpOnly',
          },
          body: JSON.stringify({ scope: 'current' }),
        });
      }
    } finally {
      setAuthToken('');
      setUser(null);
      setFavorites([]);
      setFavoritesOnly(false);
      resetCart();
    }
  }

  return (
    <BrowserRouter>
      <AppRoutes
        favorites={favorites}
        favoritesOnly={favoritesOnly}
        searchQuery={searchQuery}
        authToken={authToken}
        user={user}
        authLoading={authLoading}
        onLogin={login}
        onLogout={logout}
        setSearchQuery={setSearchQuery}
        setFavorites={setFavorites}
        toggleFavorites={() => setFavoritesOnly(active => !active)}
      />
    </BrowserRouter>
  );
}
