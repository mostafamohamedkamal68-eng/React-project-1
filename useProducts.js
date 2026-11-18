import { useEffect, useState } from 'react';
import axios from 'axios';

const STRAPI_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

function getMediaUrl(media) {
  const firstMedia = Array.isArray(media) ? media[0] : media;
  const mediaData = firstMedia?.data ?? firstMedia;
  const mediaFields = mediaData?.attributes ?? mediaData;
  const url = mediaFields?.url;

  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

function normalizeProduct(item) {
  const fields = item.attributes ?? item;
  const categoryValue = fields.pro_category ?? fields.category;
  const categoryData = categoryValue?.data ?? categoryValue;
  const categoryFields = categoryData?.attributes ?? categoryData;
  const category = typeof categoryValue === 'string'
    ? categoryValue
    : categoryFields?.name ?? categoryFields?.pro_name ?? categoryFields?.title ?? 'Vegetables';
  const rawTags = fields.pro_tags ?? fields.tags ?? [];
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

  return {
    ...fields,
    id: item.documentId ?? item.id,
    name: fields.pro_name ?? fields.name ?? 'Unnamed product',
    price: Number(fields.pro_price ?? fields.price ?? 0),
    category,
    rating: Number(fields.pro_rating ?? fields.rating ?? 5),
    tags,
    stock: fields.pro_stock ?? fields.stock ?? true,
    oldPrice: fields.pro_old_price ?? fields.oldPrice ?? null,
    sale: Boolean(fields.pro_sale ?? fields.sale ?? fields.pro_old_price ?? fields.oldPrice),
    emoji: category === 'Fresh Fruit' ? '🍏' : category === 'Vegetables' ? '🥬' : '🛍️',
    imageUrl: getMediaUrl(fields.pro_image ?? fields.image),
  };
}

export function useProducts(token = '', refreshKey = 0) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    axios.get(`${STRAPI_URL}/api/products?populate=*`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        const rows = response.data.data ?? [];
        if (!cancelled) setProducts(rows.map(normalizeProduct));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.response?.data?.error?.message ?? requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, refreshKey]);

  return { products, error, loading };
}
