import { apiGet } from "../api.js";
import { link } from "../router.js";
import { escapeHtml, loading, errorState, emptyState } from "../ui.js";

/* ---- SEARCH mode -------- */

function teamResultCard(item) {
  const { team, venue } = item;
  return `<article class="card">
    <img class="logo" src="${escapeHtml(team.logo)}" alt="${escapeHtml(team.name)} logo" loading="lazy" />
    <div class="card-body">
      <h3>${escapeHtml(team.name)}</h3>
      <p class="meta">${escapeHtml(team.country || "")}${team.founded ? ` · founded ${team.founded}` : ""}</p>
      <a href="${link("/team", { id: team.id })}">View team →</a>
    </div>
  </article>`;
}

async function runTeamSearch(term, resultsEl) {
  const query = term.trim();
  if (query.length < 3) {
    resultsEl.innerHTML = emptyState(
      "Please enter at least 3 characters to search.",
    );
    return;
  }
  resultsEl.innerHTML = loading(`Searching teams for “${query}”…`);
  try {
    const teams = await apiGet("teams", { search: query });
    if (!teams.length) {
      resultsEl.innerHTML = emptyState(`No teams found for “${query}”.`);
      return;
    }
    resultsEl.innerHTML = `<div class="grid">${teams.map(teamResultCard).join("")}</div>`;
  } catch (err) {
    resultsEl.innerHTML = errorState(err.message);
  }
}

function renderTeamSearch(params, container) {
  const query = params.q || "";
  container.innerHTML = `
    <section class="view">
      <h1>Teams</h1>
      <form class="search" id="team-search">
        <input type="search" id="team-input" value="${escapeHtml(query)}"
              placeholder="e.g. Arsenal, Barcelona" autocomplete="off" />
        <button type="submit">Search</button>
      </form>
      <div id="team-results"></div>
    </section>`;

  const form = container.querySelector("#team-search");
  const input = container.querySelector("#team-input");
  const results = container.querySelector("#team-results");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.hash = link("/teams", { q: input.value.trim() });
  });

  if (query) runTeamSearch(query, results);
}

/* -------- DETAIL mode --------- */

function squadPlayer(player) {
  return `<li class="player">
    <div>
      <span class="player-name">${escapeHtml(player.name)}</span>
      <span class="player-meta">${escapeHtml(player.position || "—")}${player.number ? ` · #${player.number}` : ""}</span>
    </div>
  </li>`;
}

async function renderTeamDetail(params, container) {
  const { id, league, season } = params;
  container.innerHTML = `<section class="view">${loading("Loading team…")}</section>`;

  try {
    // Two independent requests, fired at the SAME TIME using Promise.all.
    const [teamData, squadData] = await Promise.all([
      apiGet("teams", { id }),
      apiGet("players/squads", { team: id }),
    ]);

    if (!teamData.length) {
      container.innerHTML = `<section class="view">${emptyState("That team could not be found.")}</section>`;
      return;
    }

    const { team, venue } = teamData[0];
    const squad = squadData[0]?.players || [];

    // If we came from standings, link back to that exact table.
    const backLink =
      league && season
        ? `<a class="back" href="${link("/standings", { league, season })}">← Back to standings</a>`
        : `<a class="back" href="${link("/teams")}">← Back to team search</a>`;

    const venueBlock = venue?.name
      ? `<ul class="facts">
          <li><span>Stadium</span>${escapeHtml(venue.name)}</li>
          <li><span>City</span>${escapeHtml(venue.city || "—")}</li>
          <li><span>Capacity</span>${venue.capacity ? venue.capacity.toLocaleString() : "—"}</li>
        </ul>`
      : "";

    const squadBlock = squad.length
      ? `<h3>Squad (${squad.length})</h3><ul class="squad">${squad.map(squadPlayer).join("")}</ul>`
      : emptyState("No squad data available for this team.");

    container.innerHTML = `
      <section class="view">
        ${backLink}
        <div class="team-head">
          <img class="logo big" src="${escapeHtml(team.logo)}" alt="${escapeHtml(team.name)} logo" />
          <div>
            <h1>${escapeHtml(team.name)}</h1>
            <p class="meta">${escapeHtml(team.country || "")}${team.founded ? ` · founded ${team.founded}` : ""}</p>
          </div>
        </div>
        ${venueBlock}
        ${squadBlock}
      </section>`;
  } catch (err) {
    container.innerHTML = `<section class="view">${errorState(err.message)}</section>`;
  }
}

/* ------- entry -------- */

export function teamView(params, container) {
  if (params.id) {
    renderTeamDetail(params, container); // #/team?id=33
  } else {
    renderTeamSearch(params, container); // #/teams
  }
}
