# ⚽ football-world

A small vanilla-JavaScript website that displays live football data from the
[API-Sports Football (v3)](https://www.api-football.com/documentation-v3) API.

It uses **four** endpoints across three navigable pages:

| Page          | Endpoint(s) used                                             |
| ------------- | ------------------------------------------------------------ |
| **Leagues**   | `GET /leagues?search=` — search leagues by name              |
| **Standings** | `GET /standings?league=&season=` — league table             |
| **Teams**     | `GET /teams` (search + detail) and `GET /players/squads` — team info, venue & squad |

Every page fetches only the data it needs, and results are cached in memory so
navigating back to a page you've already visited does not re-fetch.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`).
- A **free** API-Sports key: register at
  <https://dashboard.api-football.com/register>.
