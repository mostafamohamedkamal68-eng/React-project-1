import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import EcobazarBreadcrumb from '../EcobazarBreadcrumb';
import EcobazarHeader from '../EcobazarHeader';
import EcobazarNav from '../EcobazarNav';
import EcobazarShop from '../EcobazarShop';
import Addapi from '../Addapi';
import ProductsApi from '../ProductsApi';
import '../ProductManagement.css';
import EcobazarFooter from '../../componant 1/EcobazarFooter';
import EcobazarLogin from '../../componant 1/EcobazarLogin';
import { selectCartCount, selectCartTotal, useCartStore } from '../../store/useCartStore';
import { useProducts } from '../../hooks/useProducts';

export default function AppRoutes({
  favorites,
  favoritesOnly,
  searchQuery,
  authToken,
  user,
  authLoading,
  onLogin,
  onLogout,
  setSearchQuery,
  setFavorites,
  toggleFavorites,
}) {
  const [productRefreshKey, setProductRefreshKey] = useState(0);
  const refreshProducts = () => setProductRefreshKey(current => current + 1);
  const cartItems = useCartStore((state) => state.cartItems);
  const cartOpen = useCartStore((state) => state.cartOpen);
  const cartCount = useCartStore(selectCartCount);
  const cartTotal = useCartStore(selectCartTotal);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const { products, error: productsError, loading: productsLoading } = useProducts(authToken, productRefreshKey);

  const header = (
    <EcobazarHeader
      cartTotal={`$${cartTotal.toFixed(2)}`}
      cartCount={cartCount}
      favoritesCount={favorites.length}
      favoritesActive={favoritesOnly}
      isAuthenticated={Boolean(authToken)}
         userName={user?.username || user?.email}
      onSearch={setSearchQuery}
      onFavoritesClick={toggleFavorites}
      onCartClick={toggleCart}
      onLogout={onLogout}
    />
  );
  const navigation = <EcobazarNav />;
  const breadcrumb = <EcobazarBreadcrumb />;
  const shop = (
    <EcobazarShop
      products={products}
      productsError={productsError}
      productsLoaded={!productsLoading && !productsError}
      authToken={authToken}
      onProductChanged={refreshProducts}
      searchQuery={searchQuery}
      favoritesOnly={favoritesOnly}
      onFavoritesChange={setFavorites}
      onClearSearch={() => setSearchQuery('')}
      onAddToCart={addToCart}
      cartItems={cartItems}
      cartOpen={cartOpen}
        onCartClick={toggleCart}
      onRemoveFromCart={removeFromCart}
    />
  );
  const loginAndShopPage = (
    <>
      {header}
      {navigation}
      {breadcrumb}
      <EcobazarLogin
        onLogin={onLogin}
        isAuthenticated={Boolean(authToken)}
        userName={user?.username || user?.email}
      />
      {shop}
      <EcobazarFooter />
    </>
     );

  const shopPage = (
    <>{header}{navigation}{breadcrumb}{shop}<EcobazarFooter /></>
  );
  const checkingPage = <main className="eco-login-page" role="status">Checking your session…</main>;

  return (
    <Routes>
      <Route path="/" element={authLoading ? checkingPage : loginAndShopPage} />
      <Route path="/login" element={authLoading ? checkingPage : loginAndShopPage} />
      <Route
        path="/shop"
        element={authLoading ? checkingPage : shopPage}
      />
      <Route path="/nav" element={navigation} />
      <Route path="/breadcrumb" element={breadcrumb} />
         <Route path="/header" element={header} />
      <Route
        path="/products"
        element={authToken ? <ProductsApi products={products} error={productsError} /> : <Navigate to="/login" replace />}
      />
      <Route path="/add-user" element={authToken ? <Addapi authToken={authToken} canManage={!productsLoading && !productsError} apiError={productsError} onRetry={refreshProducts} onSuccess={refreshProducts} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={authToken ? '/shop' : '/login'} replace />} />
    </Routes>
  );
}
