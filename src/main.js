import { register, setNotFound, startRouter } from './router.js';
import { leaguesView } from './views/leagues.js';
import { standingsView } from "./views/standings.js";

register('/leagues', leaguesView);
register("/standings", standingsView);
register('/teams', (params, el) => {
  el.innerHTML = '<h1>Teams page</h1>';
});

setNotFound((params, el) => {
  el.innerHTML = '<h1>Not found</h1>';
});

startRouter();