import { apiGet } from '../api.js';
import { link } from '../router.js';
import { escapeHtml, loading, errorState, emptyState } from '../ui.js';

const DEFAULT_QUERY = 'Premier League';

// From a league's seasons, pick the latest one that has standings coverage
function pickSeason(seasons = []) {
  const withStandings = seasons.filter((s) => s.coverage?.standings);
  const pool = withStandings.length ? withStandings : seasons;
  if (!pool.length) return null;
  return pool.reduce((latest, s) => (s.year > latest.year ? s : latest)).year;
}

// Build one league card's HTML
function leagueCard(item){
  const { league, country } = item;
  const season = pickSeason(item.seasons);

  const action = season
  ? `<a href="${link('/standings', { league: league.id, season })}">View ${season} standings →</a>`
    : `<span>No standings available</span>`;

  return `<article class="card">
    <img class="logo" src="${escapeHtml(league.logo)}" alt="${escapeHtml(league.name)} logo" loading="lazy" />
    <div class="card-body">
      <h3>${escapeHtml(league.name)}</h3>
      <p class="meta">${escapeHtml(country?.name || 'World')} · ${escapeHtml(league.type)}</p>
      ${action}
    </div>
  </article>`;
}

// Run the search and render results into `resultsEl`.
async function runSearch(term, resultsEl) {
  const query = term.trim();
  if (query.length < 3) {
    resultsEl.innerHTML = emptyState('Please enter at least 3 characters to search.');
    return;
  }

  resultsEl.innerHTML = loading(`Searching leagues for “${query}”…`);
  try {
    const leagues = await apiGet('leagues', { search: query });
    if (!leagues.length) {
      resultsEl.innerHTML = emptyState(`No leagues found for “${query}”.`);
      return;
    }
    resultsEl.innerHTML = `<div class="grid">${leagues.map(leagueCard).join('')}</div>`;
  } catch (err) {
    resultsEl.innerHTML = errorState(err.message);
  }
}

// The view function the router calls.
export function leaguesView(params, container) {
  const query = params.q || DEFAULT_QUERY;

  container.innerHTML = `
    <section class="view">
      <h1>Leagues</h1>
      <form class="search" id="league-search">
        <input type="search" id="league-input" value="${escapeHtml(query)}"
               placeholder="e.g. Premier League, La Liga" autocomplete="off" />
        <button type="submit">Search</button>
      </form>
      <div id="league-results"></div>
    </section>`;

  const form = container.querySelector('#league-search');
  const input = container.querySelector('#league-input');
  const results = container.querySelector('#league-results');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Put the search term in the URL, let the router re-run this view.
    window.location.hash = link('/leagues', { q: input.value.trim() });
  });

  runSearch(query, results);
}