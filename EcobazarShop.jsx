import { useEffect, useMemo, useState } from 'react';
import Addapi from './Addapi';
import Updateapi from './Updateapi';
import Deleteapi from './Deleteapi';
import './EcobazarShop.css';

const fallbackProducts = [
  { id: 18, name: 'Big Potatoes', category: 'Vegetables', price: 14.99, rating: 4.5, emoji: '🥔', tags: ['Healthy', 'Vegetarian', 'Dinner'], stock: true },
  { id: 17, name: 'Chinese Cabbage', category: 'Vegetables', price: 14.99, rating: 4.8, emoji: '🥬', tags: ['Healthy', 'Low fat', 'Vegetarian', 'Vitamins'], stock: true },
  { id: 16, name: 'Ladies Finger', category: 'Vegetables', price: 14.99, rating: 4.3, emoji: '🌽', tags: ['Healthy', 'Low fat', 'Vegetarian'], stock: false },
  { id: 15, name: 'Eggplant', category: 'Vegetables', price: 14.99, rating: 4.2, emoji: '🍆', tags: ['Healthy', 'Low fat', 'Vegetarian'], stock: true },
  { id: 14, name: 'Fresh Cauliflower', category: 'Vegetables', price: 14.99, rating: 4.6, emoji: '🥦', tags: ['Healthy', 'Low fat', 'Vegetarian', 'Vitamins'], stock: true },
  { id: 13, name: 'Green Apple', category: 'Fresh Fruit', price: 14.99, rating: 4.7, emoji: '🍏', tags: ['Healthy', 'Low fat', 'Vegetarian', 'Fruit', 'Vitamins'], stock: true },
  { id: 12, name: 'Green Capsicum', category: 'Vegetables', price: 14.99, rating: 4.1, emoji: '🫑', tags: ['Healthy', 'Vegetarian', 'Vitamins'], stock: true },
  { id: 11, name: 'Green Chili', category: 'Vegetables', price: 14.99, rating: 4.4, emoji: '🌶️', tags: ['Healthy', 'Low fat', 'Vegetarian'], stock: true },
  { id: 10, name: 'Green Cucumber', category: 'Vegetables', price: 14.99, rating: 4.1, emoji: '🥒', tags: ['Healthy', 'Low fat', 'Vegetarian'], stock: true },
  { id: 9, name: 'Green Lettuce', category: 'Vegetables', price: 14.99, rating: 4.3, emoji: '🥬', tags: ['Healthy', 'Low fat', 'Vegetarian', 'Vitamins'], stock: true },
  { id: 8, name: 'Red Capsicum', category: 'Vegetables', price: 14.99, oldPrice: 20.99, rating: 4.7, emoji: '🫑', tags: ['Healthy', 'Vegetarian', 'Vitamins'], stock: true, sale: true },
  { id: 7, name: 'Red Chili', category: 'Vegetables', price: 14.99, rating: 4.2, emoji: '🌶️', tags: ['Healthy', 'Low fat', 'Vegetarian'], stock: true },
  { id: 6, name: 'Red Tomato', category: 'Vegetables', price: 14.99, rating: 4.8, emoji: '🍅', tags: ['Healthy', 'Low fat', 'Vegetarian', 'Vitamins'], stock: true },
  { id: 5, name: 'Fresh Mango', category: 'Fresh Fruit', price: 14.99, rating: 4.6, emoji: '🥭', tags: ['Healthy', 'Vegetarian', 'Fruit', 'Vitamins'], stock: true },
  { id: 4, name: 'Whole Wheat Bread', category: 'Bread & Bakery', price: 8.99, rating: 4.4, emoji: '🍞', tags: ['Healthy', 'Kid foods', 'Bread', 'Breakfast'], stock: true },
  { id: 3, name: 'Orange Juice', category: 'Beverages', price: 6.99, rating: 4.0, emoji: '🧃', tags: ['Healthy', 'Kid foods', 'Fruit', 'Breakfast'], stock: true },
  { id: 2, name: 'Fruit Snack Mix', category: 'Snacks', price: 5.49, rating: 3.8, emoji: '🥜', tags: ['Healthy', 'Snacks', 'Tiffin'], stock: true },
  { id: 1, name: 'Cooking Olive Oil', category: 'Cooking', price: 12.99, rating: 4.5, emoji: '🫒', tags: ['Healthy', 'Dinner'], stock: true },
];
const defaultCategories = ['Fresh Fruit', 'Vegetables', 'Cooking', 'Snacks', 'Beverages', 'Beauty & Health', 'Bread & Bakery'];
const tags = ['Healthy', 'Low fat', 'Vegetarian', 'Kid foods', 'Vitamins', 'Bread', 'Meat', 'Snacks', 'Tiffin', 'Launch', 'Dinner', 'Breakfast', 'Fruit'];
const localProductsStorageKey = 'ecobazar.local-products.v1';

function readLocalProducts() {
  try {
    const savedProducts = JSON.parse(window.localStorage.getItem(localProductsStorageKey));
    return Array.isArray(savedProducts) ? savedProducts : null;
  } catch {
    return null;
  }
}

function Stars({ rating }) {
  return <span className="eco-product-stars" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(Math.round(rating))}<span>{'★'.repeat(5 - Math.round(rating))}</span></span>;
}

function Heart({ filled }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}><path d="M20.4 8.7c0 4.2-8.4 10.2-8.4 10.2S3.6 12.9 3.6 8.7a4.4 4.4 0 0 1 8.4-1.8 4.4 4.4 0 0 1 8.4 1.8Z" /></svg>;
}

export default function EcobazarShop({
  products: apiProducts = [],
  productsError = '',
  productsLoaded = false,
  authToken = '',
  onProductChanged = () => {},
  searchQuery = '',
  favoritesOnly = false,
  onFavoritesChange = () => {},
  onClearSearch = () => {},
  onAddToCart = () => {},
  cartItems = [],
  cartOpen = false,
  onCartClick = () => {},
  onRemoveFromCart = () => {},
}) {
  const [category, setCategory] = useState('All Categories');
  const [maxPrice, setMaxPrice] = useState(null);
  const [minimumRating, setMinimumRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sort, setSort] = useState('latest');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [localProducts, setLocalProducts] = useState(readLocalProducts);
  const serverProducts = apiProducts.length || productsLoaded ? apiProducts : fallbackProducts;
  const products = localProducts ?? serverProducts;
  const maxAvailablePrice = Math.max(25, ...products.map(product => Number(product.price) || 0));
  const activeMaxPrice = maxPrice === null ? maxAvailablePrice : Math.min(maxPrice, maxAvailablePrice);
  const localMode = !authToken || Boolean(productsError);

  useEffect(() => {
    if (!authToken || !productsLoaded) return;
    try {
      window.localStorage.removeItem(localProductsStorageKey);
    } catch {
      // The server catalog remains usable when browser storage is unavailable.
    }
    setLocalProducts(null);
  }, [authToken, productsLoaded]);

  function saveLocalProducts(update) {
    const nextProducts = update(localProducts ?? serverProducts);
    setLocalProducts(nextProducts);
    try {
      window.localStorage.setItem(localProductsStorageKey, JSON.stringify(nextProducts));
    } catch {
      // Keep the current session usable even when browser storage is unavailable.
    }
  }

  function createLocalProduct({ name, price }) {
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    saveLocalProducts(current => [
      { id, name, price, category: 'Vegetables', rating: 5, emoji: '🥬', tags: [], stock: true },
      ...current,
    ]);
  }

  function updateLocalProduct(productId, updates) {
    saveLocalProducts(current => current.map(product =>
      product.id === productId ? { ...product, ...updates } : product
    ));
  }

  function deleteLocalProduct(productId) {
    saveLocalProducts(current => current.filter(product => product.id !== productId));
  }
  const categories = [...new Set([...defaultCategories, ...products.map(product => product.category).filter(Boolean)])];
  const discountedProducts = products.filter(product => product.sale || product.oldPrice);
  const saleProducts = (discountedProducts.length ? discountedProducts : products).slice(0, 3);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleProducts = useMemo(() => {
    const matching = products.filter(product =>
      (category === 'All Categories' || product.category === category) &&
      product.price <= activeMaxPrice &&
      product.rating >= minimumRating &&
      selectedTags.every(tag => product.tags.includes(tag)) &&
      (!normalizedSearch || `${product.name} ${product.category} ${product.tags.join(' ')}`.toLowerCase().includes(normalizedSearch)) &&
      (!favoritesOnly || favorites.includes(product.id))
    );
    if (sort === 'price-low') matching.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') matching.sort((a, b) => b.price - a.price);
    if (sort === 'rating') matching.sort((a, b) => b.rating - a.rating);
    if (sort === 'latest') matching.sort((a, b) => b.id - a.id);
    return matching;
  }, [category, activeMaxPrice, minimumRating, selectedTags, sort, normalizedSearch, favoritesOnly, favorites]);

  function toggleTag(tag) {
    setSelectedTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]);
  }

  function toggleFavorite(id) {
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    setFavorites(next);
    onFavoritesChange(next);
  }

  function addProductToCart(product) {
    onAddToCart(product);
  }

   function clearFilters() {
    setCategory('All Categories');
    setMaxPrice(null);
    setMinimumRating(0);
    setSelectedTags([]);
    onClearSearch();
  }

  return (
    <main className="eco-shop" id="shop">
      <div className="eco-shop-toolbar">
        <button className="eco-filter-button" type="button" onClick={() => setFiltersOpen(open => !open)}>
          Filter <span aria-hidden="true">☷</span>
        </button>
        <label className="eco-sort">Sort by:
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
        <p className="eco-result-count"><strong>{visibleProducts.length}</strong> Results Found</p>
        <button className="eco-cart-count-label" type="button" onClick={onCartClick}>
          Cart: {cartItems.reduce((count, item) => count + item.quantity, 0)}
        </button>
      </div>
      {normalizedSearch && <p className="eco-search-status">Search results for “{searchQuery.trim()}”</p>}
      {favoritesOnly && <p className="eco-search-status">Showing your favorites</p>}
      {cartOpen && <section className="eco-cart-summary" id="cart-summary" aria-label="Shopping cart">
        <h2>Your cart</h2>
        {cartItems.length === 0 ? <p>Your cart is empty.</p> : <>
          {cartItems.map(item => <div className="eco-cart-row" key={item.id}>
            <span>{item.name} × {item.quantity}<small>${item.price.toFixed(2)} each</small></span>
            <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            <button type="button" onClick={() => onRemoveFromCart(item.id)}>Remove one</button>
          </div>)}
          <strong>Subtotal: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong>
        </>}
      </section>}
       <div className={`eco-shop-layout${filtersOpen ? '' : ' filters-hidden'}`}>
        {filtersOpen && <aside className="eco-shop-sidebar">
          <section className="eco-filter-group">
            <div className="eco-filter-title"><h2>All Categories</h2><span>⌃</span></div>
            {categories.map(item => <label className="eco-category-option" key={item}>
              <input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} />
              <span>{item}</span><small>({products.filter(product => product.category === item).length})</small>
            </label>)}
          </section>

          <section className="eco-filter-group">
            <div className="eco-filter-title"><h2>Price</h2><span>⌃</span></div>
            <input className="eco-price-slider" type="range" min="1" max={maxAvailablePrice} step="0.5" value={activeMaxPrice} onChange={event => setMaxPrice(Number(event.target.value))} aria-label="Maximum price" />
            <p className="eco-price-range">Price: <strong>$1.00 — ${activeMaxPrice.toFixed(2)}</strong></p>
          </section>

          <section className="eco-filter-group">
            <div className="eco-filter-title"><h2>Rating</h2><span>⌃</span></div>
            {[0, 4, 3, 2, 1].map(rating => <label className="eco-rating-option" key={rating}>
              <input type="radio" name="rating" checked={minimumRating === rating} onChange={() => setMinimumRating(rating)} />
              <Stars rating={rating || 5} /><span>{rating === 0 ? 'All ratings' : `${rating}.0 & up`}</span>
            </label>)}
               </section>

          <section className="eco-filter-group eco-tag-filter">
            <div className="eco-filter-title"><h2>Popular Tag</h2><span>⌃</span></div>
            <div className="eco-tag-list">{tags.map(tag => <button type="button" key={tag} className={selectedTags.includes(tag) ? 'selected' : ''} onClick={() => toggleTag(tag)}>{tag}</button>)}</div>
          </section>

          <section className="eco-sale-box">
            <div><strong>79%</strong> Discount<p>on your first order</p><button type="button" onClick={clearFilters}>Shop Now →</button></div>
            <span aria-hidden="true">🫑🧅</span>
          </section>

          <section className="eco-sale-products">
            <h2>Sale Products</h2>
            {saleProducts.map(product => <button type="button" className="eco-sale-item" key={product.id} aria-label={`Add ${product.name} to cart`} onClick={() => addProductToCart(product)}>
              <span className="eco-sale-emoji">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : product.emoji}</span>
              <span className="eco-sale-details"><span className="eco-sale-name">{product.name}</span><span className="eco-sale-price"><strong>${product.price.toFixed(2)}</strong> <del>${(product.oldPrice || product.price + 5).toFixed(2)}</del></span><Stars rating={product.rating} /></span>
            </button>)}
          </section>
        </aside>}
         <section className="eco-products" aria-label="Products">
          <div className="eco-product-adminbar">
            <Addapi authToken={authToken} canManage={productsLoaded} localMode={localMode} apiError={productsError} onRetry={onProductChanged} onSuccess={onProductChanged} onCreateLocal={createLocalProduct} />
            {authToken && !productsLoaded && <p className="eco-product-admin-status">{productsError ? 'Strapi is not connected; open an action for details.' : 'Loading products from Strapi…'}</p>}
          </div>
          {productsError && <p className="eco-api-error" role="status">تعذّر تحميل منتجات Strapi؛ يتم عرض المنتجات الافتراضية مؤقتًا.</p>}
          {localMode && <p className="eco-product-local-note" role="status">Changes are saved in this browser while Strapi is unavailable or you are signed out.</p>}
          {visibleProducts.length === 0 ? <div className="eco-empty-state"><span>🥬</span><h2>No products found</h2><p>Try changing your filters.</p><button type="button" onClick={clearFilters}>Clear filters</button></div> : <div className="eco-product-grid">
            {visibleProducts.map(product => <article className="eco-product-card eco-product-card--admin-visible" key={product.id}>
              {product.sale && <span className="eco-sale-badge">Sale 50%</span>}
              {!product.stock && <span className="eco-stock-badge">Out of Stock</span>}
              <div className="eco-product-admin-actions" aria-label={`Manage ${product.name}`}>
                <Updateapi authToken={authToken} product={product} canManage={productsLoaded} localMode={localMode} apiError={productsError} onRetry={onProductChanged} onSuccess={onProductChanged} onUpdateLocal={updateLocalProduct} />
                <Deleteapi authToken={authToken} product={product} canManage={productsLoaded} localMode={localMode} apiError={productsError} onRetry={onProductChanged} onSuccess={onProductChanged} onDeleteLocal={deleteLocalProduct} />
              </div>
              <button type="button" className={`eco-favorite${favorites.includes(product.id) ? ' active' : ''}`} aria-label={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart filled={favorites.includes(product.id)} /></button>
              <button type="button" className="eco-product-select" aria-label={`Add ${product.name} to cart`} disabled={!product.stock} onClick={() => addProductToCart(product)}>
                <span className="eco-product-art" aria-hidden="true">{product.imageUrl ? <img className="eco-product-image" src={product.imageUrl} alt="" /> : product.emoji}</span>
                <span className="eco-product-info">
                  <span className="eco-product-name">{product.name}</span>
                  <span className="eco-product-price"><strong>${product.price.toFixed(2)}</strong>{product.oldPrice && <del>${product.oldPrice.toFixed(2)}</del>}</span>
                  <Stars rating={product.rating} />
                </span>
              </button>
              <button type="button" className={`eco-add-cart${!product.stock ? ' disabled' : ''}`} aria-label={`Add ${product.name} to cart`} disabled={!product.stock} onClick={() => addProductToCart(product)}>{product.stock ? '+' : '▱'}</button>
            </article>)}
          </div>}
        </section>
      </div>
    </main>
  );
}
