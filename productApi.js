const STRAPI_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

export async function requestProductApi(path, { token = '', method = 'GET', data } = {}) {
  let response;

  try {
    response = await fetch(`${STRAPI_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(data === undefined ? {} : { body: JSON.stringify({ data }) }),
    });
  } catch {
    throw new Error('Could not connect to Strapi. Make sure the server is running.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `Strapi request failed (${response.status})`);
  }

  return payload;
}
