// ---------------------------------------------------------------------------
// Small shared UI helpers used by every view.
// ---------------------------------------------------------------------------

/** Escape user/API-supplied text before inserting it into HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Centered loading spinner + message. */
export function loading(message = 'Loading…') {
  return `<div class="state"><div class="spinner" aria-hidden="true"></div><p>${escapeHtml(
    message
  )}</p></div>`;
}

/** Friendly error block. */
export function errorState(message) {
  return `<div class="state error" role="alert">
    <p><strong>Something went wrong.</strong></p>
    <p>${escapeHtml(message)}</p>
  </div>`;
}

/** Empty / no-results block. */
export function emptyState(message) {
  return `<div class="state"><p>${escapeHtml(message)}</p></div>`;
}
