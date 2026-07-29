// A tiny hash-based router.
// Routes look like:  #/standings?league=39&season=2023

const routes = new Map();

let notFoundHandler = null;

// Register a view function for a path, e.g. register('/leagues', leaguesView)
export function register(path, handler) {
  routes.set(path, handler);
}

// What to show when no route matches
export function setNotFound(handler) {
  notFoundHandler = handler;
}

// Turn "#/standings?league=39" into { path: "/standings", params: { league: "39" } }
function parseHash() {
  const hash = window.location.hash.slice(1) || '/leagues';   // drop the "#"
  const [path, queryString = ''] = hash.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryString));
  return { path, params };
}

// Look up the current route and render it
function resolve() {
  const container = document.getElementById('app');
  const { path, params } = parseHash();
  const handler = routes.get(path) || notFoundHandler;
  if (handler) handler(params, container);
}

// Start listening and render the first view
export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();   // render whatever the URL says on first load
}

// Helper to build hash links: link('/standings', { league: 39 }) -> "#/standings?league=39"
export function link(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `#${path}${query ? `?${query}` : ''}`;
}