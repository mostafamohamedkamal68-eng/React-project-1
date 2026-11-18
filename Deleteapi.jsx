import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { requestProductApi } from './productApi';

export default function Deleteapi({ authToken = '', product, canManage = true, localMode = false, apiError = '', onRetry = () => {}, onSuccess = () => {}, onDeleteLocal = () => {} }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function deleteProduct() {
    if (!product || loading || (!localMode && (!authToken || !canManage))) return;

    setError('');
    setLoading(true);
    try {
      if (localMode) {
        onDeleteLocal(product.id);
      } else {
        await requestProductApi(`/api/products/${encodeURIComponent(product.id)}`, {
          token: authToken,
          method: 'DELETE',
        });
        onSuccess();
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
      <button className="eco-product-admin-button eco-product-admin-button--danger" type="button" onClick={() => { setError(''); setOpen(true); }} aria-label={`Delete ${product.name}`} title={`Delete ${product.name}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5M14 11v5" /></svg>
      </button>
      {error && !open && <span className="eco-product-admin-error" role="alert">{error}</span>}
      {open && createPortal(
        <div className="eco-product-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
          <section className="eco-product-modal" role="dialog" aria-modal="true" aria-labelledby={`eco-delete-product-title-${product.id}`}>
            <button className="eco-product-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <h2 id={`eco-delete-product-title-${product.id}`}>Delete {product.name}?</h2>
            {localMode ? (
              <p className="eco-product-delete-copy">This removes the product from this browser's saved catalog.</p>
            ) : !authToken ? (
              <div className="eco-product-admin-message">
                <p>Sign in before deleting this product.</p>
                <Link className="eco-add-product-link" to="/login">Go to login</Link>
              </div>
            ) : !canManage ? (
              <div className="eco-product-admin-message">
                <p>Strapi products are not available yet{apiError ? `: ${apiError}` : '.'}</p>
                <button className="eco-product-modal-cancel" type="button" onClick={onRetry}>Retry connection</button>
              </div>
            ) : null}
            {(localMode || (authToken && canManage)) && (
              <>
                {!localMode && <p className="eco-product-delete-copy">This will remove the product from the Strapi catalog.</p>}
                {error && <p className="eco-api-error" role="alert">{error}</p>}
                <div className="eco-product-modal-actions">
                  <button className="eco-product-modal-cancel" type="button" onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
                  <button className="eco-product-delete-confirm" type="button" onClick={deleteProduct} disabled={loading}>{loading ? 'Deleting…' : 'Delete product'}</button>
                </div>
              </>
            )}
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
