// Serverless proxy. Vercel turns this file into:  GET /api/football?endpoint=...
// The real key lives ONLY here, in a server-side env var — never sent to browsers.
// API_FOOTBALL_KEY, so it is never exposed to the browser in production.
// The frontend calls e.g.  /api/football?endpoint=leagues&search=arsenal
// and this function forwards it to the upstream API with the secret header.

const BASE_URL = "https://v3.football.api-sports.io";

// Only allow the endpoints your app actually uses (prevents misuse of your key).
const ALLOWED = new Set(["leagues", "standings", "teams", "players/squads"]);

export default async function handler(req, res) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ errors: { config: "Server is missing API_FOOTBALL_KEY." } });
  }

  const { endpoint, ...params } = req.query;
  if (!endpoint || !ALLOWED.has(endpoint)) {
    return res
      .status(400)
      .json({ errors: { endpoint: "Unknown or missing endpoint." } });
  }

  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/${endpoint}${query ? `?${query}` : ""}`;

  try {
    const upstream = await fetch(url, { headers: { "x-apisports-key": key } });
    const body = await upstream.json();
    return res.status(upstream.status).json(body);
  } catch (err) {
    return res
      .status(502)
      .json({ errors: { upstream: "Could not reach the football API." } });
  }
}
