# ⚽ football-world:  https://semhar-football-world.vercel.app/

A small vanilla JavaScript website that displays live football data from the
[API-Sports Football (v3)](https://www.api-football.com/documentation-v3) API. It datasearch leagues, view standings, and drill into teams and their squads.

## Tech Stack
- Vanilla JavaScript
- Vite: dev server and build tool
- HTML & CSS
- API Sports Football (v3) REST API
- Vercel: hosting and serverless functions
  

## Prerequisites
- Node.js 18+ and `npm`.
- A free API-Sports key: register at 
  <https://dashboard.api-football.com/register>.


## Installation
```bash
git clone https://github.com/SemharTes/football-world.git
cd football-world
npm install
```


## Configuration

Create a `.env` file in the project root with your API-Sports key:

```
VITE_API_FOOTBALL_KEY=your_api_key_here
```

- `.env` is git-ignored. In development, Vite injects the key into the browser at build time.
- In production the browser never receives the key.

|          Variable       |    Environment     |      Purpose     |
| `VITE_API_FOOTBALL_KEY` | Local dev (`.env`) | Sent from the browser during development |
| `API_FOOTBALL_KEY`      | Production (host env vars) | Read only by the serverless proxy; never exposed |

## Running the Project

```bash
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
```


## API / Usage

Data comes from the API-Sports Football (v3) API. In production, requests pass through `/api/football?endpoint=<name>` so the key stays server-side.

It uses **four** endpoints across three navigable pages:

| Page          | Endpoint(s) used                                             |
| ------------- | ------------------------------------------------------------ |
| **Leagues**   | `GET /leagues?search=` search leagues by name              |
| **Standings** | `GET /standings?league=&season=` league table for a league and season |
| **Teams**     | `GET /teams` (search + detail) and `GET /players/squads` team info, venue & squad |

- Every page fetches only the data it needs, and results are cached in memory so navigating back to a page you've already visited does not re-fetch.
- API key hidden behind a serverless proxy in production


## Deployment
Deployed on Vercel with automatic deploys from the `main` branch. Set `API_FOOTBALL_KEY` (no `VITE_` prefix) in the Vercel project's environment variables.







