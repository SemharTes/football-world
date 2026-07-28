// ---------------------------------------------------------------------------
// Thin wrapper around the API-Sports Football (v3) REST API.
//
// Two modes, chosen automatically:
//   • Local dev  (import.meta.env.DEV):  call the API directly, sending the key
//     from the ".env" file as a header. Keeps `npm run dev` zero-setup.
//   • Production (import.meta.env.PROD): call our own /api/football serverless
//     proxy, which holds the key server-side. The key is NEVER shipped to the
//     browser in the deployed build.
// ---------------------------------------------------------------------------

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const USE_PROXY = import.meta.env.PROD;

// Simple in-memory cache so that navigating back to a page we already loaded
// does not fire a second network request for the same data.
const cache = new Map();

/**
 * Build the request URL + headers for the current mode.
 * In proxy mode the endpoint travels as a query param and no key is attached.
 */
function buildRequest(endpoint, params) {
  if (USE_PROXY) {
    const query = new URLSearchParams({ endpoint, ...params }).toString();
    return { url: `/api/football?${query}`, headers: {} };
  }
  const query = new URLSearchParams(params).toString();
  return {
    url: `${BASE_URL}/${endpoint}${query ? `?${query}` : ''}`,
    headers: { 'x-apisports-key': API_KEY },
  };
}

/**
 * Perform a GET request against an API-Sports endpoint.
 *
 * @param {string} endpoint  e.g. "leagues"
 * @param {Object} params    query-string parameters, e.g. { search: "premier" }
 * @returns {Promise<Array>} the `response` array from the API payload
 */
export async function apiGet(endpoint, params = {}) {
  // In dev the browser needs the key; in prod the server holds it instead.
  if (!USE_PROXY && !API_KEY) {
    throw new Error(
      'Missing API key. Copy ".env.example" to ".env" and add your API-Sports key, then restart the dev server.'
    );
  }

  const { url, headers } = buildRequest(endpoint, params);

  // Cache key includes the endpoint so dev and proxy URLs don't collide oddly.
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  let payload;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Network error (${res.status} ${res.statusText}).`);
    }
    payload = await res.json();
  } catch (err) {
    // Normalise fetch/parse failures into a friendly message.
    throw new Error(err.message || 'Could not reach the football API.');
  }

  // The API returns HTTP 200 even for auth/quota problems; those show up in
  // the `errors` field of the body, so surface them as real errors.
  if (payload.errors && Object.keys(payload.errors).length > 0) {
    const messages = Object.values(payload.errors).join(' ');
    throw new Error(messages || 'The football API returned an error.');
  }

  const data = payload.response || [];
  cache.set(cacheKey, data);
  return data;
}