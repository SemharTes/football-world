import { apiGet } from "../api.js";
import { link } from "../router.js";
import { escapeHtml, loading, errorState, emptyState } from "../ui.js";

// Defaults so the page is useful when opened straight from the nav.
const DEFAULT_LEAGUE = "39"; // Premier League
const DEFAULT_SEASON = "2023";

// One table row for one team.
function standingsRow(row, league, season) {
  const { rank, team, all, goalsDiff, points } = row;
  const teamHref = link("/team", { id: team.id, league: league.id, season });

  return `<tr>
    <td class="rank">${rank}</td>
    <td class="team-cell">
      <a href="${teamHref}">
        <img class="badge" src="${escapeHtml(team.logo)}" alt="" loading="lazy" />
        <span>${escapeHtml(team.name)}</span>
      </a>
    </td>
    <td>${all.played}</td>
    <td>${all.win}</td>
    <td>${all.draw}</td>
    <td>${all.lose}</td>
    <td>${all.goals.for}:${all.goals.against}</td>
    <td>${goalsDiff}</td>
    <td class="points">${points}</td>
  </tr>`;
}

// One table for one group of teams.
function standingsTable(group, league, season) {
  const rows = group.map((row) => standingsRow(row, league, season)).join("");
  return `<div class="table-wrap">
    <table class="standings">
      <thead>
        <tr>
          <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
          <th>Goals</th><th>GD</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// Fetch + render the standings.
async function loadStandings(leagueId, season, target) {
  target.innerHTML = loading("Loading standings…");
  try {
    const data = await apiGet("standings", { league: leagueId, season });
    if (!data.length) {
      target.innerHTML = emptyState(
        "No standings for that league/season. Free API keys cover seasons 2021–2023.",
      );
      return;
    }

    const league = data[0].league;
    const groups = league.standings || []; // array of groups, each an array of rows
    const tables = groups
      .map((g) => standingsTable(g, league, season))
      .join("");

    target.innerHTML = `
      <div class="league-head">
        <img class="logo" src="${escapeHtml(league.logo)}" alt="" />
        <div>
          <h2>${escapeHtml(league.name)}</h2>
          <p class="meta">${escapeHtml(league.country)} · Season ${escapeHtml(String(season))}</p>
        </div>
      </div>
      ${tables}`;
  } catch (err) {
    target.innerHTML = errorState(err.message);
  }
}

// The view function the router calls.
export function standingsView(params, container) {
  const leagueId = params.league || DEFAULT_LEAGUE;
  const season = params.season || DEFAULT_SEASON;

  container.innerHTML = `
    <section class="view">
      <h1>Standings</h1>
      <form class="inline-form" id="standings-form">
        <label>League ID
          <input type="number" id="s-league" value="${escapeHtml(leagueId)}" min="1" required />
        </label>
        <label>Season
          <input type="number" id="s-season" value="${escapeHtml(season)}" min="2000" max="2100" required />
        </label>
        <button type="submit">Show table</button>
      </form>
      <div id="standings-results"></div>
    </section>`;

  const form = container.querySelector("#standings-form");
  const results = container.querySelector("#standings-results");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const l = container.querySelector("#s-league").value.trim();
    const s = container.querySelector("#s-season").value.trim();
    if (!l || !s) {
      results.innerHTML = emptyState(
        "Please provide both a league ID and a season.",
      );
      return;
    }
    window.location.hash = link("/standings", { league: l, season: s });
  });

  loadStandings(leagueId, season, results);
}
