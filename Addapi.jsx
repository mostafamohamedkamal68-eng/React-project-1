import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { requestProductApi } from './productApi';

export default function Addapi({ authToken = '', canManage = true, localMode = false, apiError = '', onRetry = () => {}, onSuccess = () => {}, onCreateLocal = () => {} }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function addProduct(event) {
    event.preventDefault();
    setError('');

    const numericPrice = Number(price);
    if (!name.trim() || !Number.isInteger(numericPrice) || numericPrice < 0) {
      setError('Enter a product name and a whole-number price of 0 or more.');
      return;
    }

    setLoading(true);
    try {
      if (localMode) {
        onCreateLocal({ name: name.trim(), price: numericPrice });
        setResult('Product saved in this browser.');
      } else {
        await requestProductApi('/api/products', {
          token: authToken,
          method: 'POST',
          data: { pro_name: name.trim(), pro_price: numericPrice },
        });
        onSuccess();
        setResult('Product added successfully.');
      }
      setName('');
      setPrice('');
      setOpen(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="eco-add-product-trigger" type="button" onClick={() => { setError(''); setOpen(true); }}>
        <span aria-hidden="true">+</span> Add vegetable
      </button>
      {result && <span className="eco-product-admin-success" role="status">{result}</span>}
      {open && createPortal(
        <div className="eco-product-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
          <section className="eco-product-modal" role="dialog" aria-modal="true" aria-labelledby="eco-add-product-title">
            <button className="eco-product-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <h2 id="eco-add-product-title">Add a vegetable</h2>
            {localMode ? (
              <p className="eco-product-local-note">You can manage the sample catalog here. Changes stay in this browser.</p>
            ) : !authToken ? (
              <div className="eco-product-admin-message">
                <p>Sign in before adding a product.</p>
                <Link className="eco-add-product-link" to="/login">Go to login</Link>
              </div>
            ) : !canManage ? (
              <div className="eco-product-admin-message">
                <p>Strapi products are not available yet{apiError ? `: ${apiError}` : '.'}</p>
                <button className="eco-product-modal-cancel" type="button" onClick={onRetry}>Retry connection</button>
              </div>
            ) : null}
            {(localMode || (authToken && canManage)) && (
              <form className="eco-api-form" onSubmit={addProduct}>
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
                  <button className="eco-api-button" type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add vegetable'}</button>
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
