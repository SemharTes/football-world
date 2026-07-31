import "./style.css";
import { register, setNotFound, startRouter } from "./router.js";
import { leaguesView } from "./views/leagues.js";
import { standingsView } from "./views/standings.js";
import { teamView } from "./views/team.js";

register("/leagues", leaguesView);
register("/standings", standingsView);
register("/teams", teamView); // search mode
register("/team", teamView); // detail mode (?id=...)

setNotFound((params, el) => {
  el.innerHTML = "<h1>Not found</h1>";
});

startRouter(); 
