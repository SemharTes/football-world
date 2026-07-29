// to be cont

import { register, setNotFound, startRouter } from './router.js';
import { leaguesView } from './views/leagues.js';

register('/leagues', leaguesView);

register('/standings', (params, el) => {
  el.innerHTML = '<h1>Standings page</h1>';
});
register('/teams', (params, el) => {
  el.innerHTML = '<h1>Teams page</h1>';
});

setNotFound((params, el) => {
  el.innerHTML = '<h1>Not found</h1>';
});

startRouter();