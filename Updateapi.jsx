import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { requestProductApi } from './productApi';

export default function Updateapi({ authToken = '', product, canManage = true, localMode = false, apiError = '', onRetry = () => {}, onSuccess = () => {}, onUpdateLocal = () => {} }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(product?.name ?? '');
    setPrice(product ? String(product.price) : '');
  }, [product?.id, product?.name, product?.price]);

  async function updateProduct(event) {
    event.preventDefault();
    setError('');

    if (!localMode && !canManage) {
      setError('Connect to Strapi before editing products.');
      return;
    }

    const numericPrice = Number(price);
    if (!product || !name.trim() || !Number.isInteger(numericPrice) || numericPrice < 0) {
      setError('Enter a product name and a whole-number price of 0 or more.');
      return;
    }

    setLoading(true);
    try {
      if (localMode) {
        onUpdateLocal(product.id, { name: name.trim(), price: numericPrice });
        setResult('Changes saved in this browser.');
      } else {
        await requestProductApi(`/api/products/${encodeURIComponent(product.id)}`, {
          token: authToken,
          method: 'PUT',
          data: { pro_name: name.trim(), pro_price: numericPrice },
        });
        onSuccess();
        setResult('Product updated.');
      }
      setOpen(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (!product) return null;

  return (
    <>
      <button className="eco-product-admin-button" type="button" onClick={() => { setError(''); setResult(''); setOpen(true); }} aria-label={`Edit ${product.name}`} title={`Edit ${product.name}`}>
        <span aria-hidden="true">✎</span>
      </button>
      {result && <span className="eco-product-admin-success" role="status">{result}</span>}
      {open && createPortal(
        <div className="eco-product-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
          <section className="eco-product-modal" role="dialog" aria-modal="true" aria-labelledby={`eco-update-product-title-${product.id}`}>
            <button className="eco-product-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <h2 id={`eco-update-product-title-${product.id}`}>Edit {product.name}</h2>
            {localMode ? (
              <p className="eco-product-local-note">Changes to this product stay in this browser.</p>
            ) : !authToken ? (
              <div className="eco-product-admin-message">
                <p>Sign in before editing this product.</p>
                <Link className="eco-add-product-link" to="/login">Go to login</Link>
              </div>
            ) : !canManage ? (
              <div className="eco-product-admin-message">
                <p>Strapi products are not available yet{apiError ? `: ${apiError}` : '.'}</p>
                <button className="eco-product-modal-cancel" type="button" onClick={onRetry}>Retry connection</button>
              </div>
            ) : null}
            {(localMode || (authToken && canManage)) && (
              <form className="eco-api-form" onSubmit={updateProduct}>
                <label className="eco-api-field">
                  Product name
                  <input value={name} onChange={event => setName(event.target.value)} maxLength={120} autoFocus required />
                </label>
                <label className="eco-api-field">
                  Price ($)
                  <input type="number" min="0" step="1" value={price} onChange={event => setPrice(event.target.value)} required />
                </label>
                {error && <p className="eco-api-error" role="alert">{error}</p>}
                <div className="eco-product-modal-actions">
                  <button className="eco-product-modal-cancel" type="button" onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
                  <button className="eco-api-button" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
                </div>
              </form>
            )}
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
