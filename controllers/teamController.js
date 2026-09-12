const SPORTS_DB_URL = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";

const leagues = [
  { name: "Premier League", apiNames: ["English Premier League", "Premier League"], country: "Inglaterra", flag: "ENG", code: "PL", leagueId: "4328", badge: "https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png", accent: "violet", description: "Intensidad, ritmo y alcance global." },
  { name: "LaLiga", apiNames: ["Spanish La Liga", "La Liga", "LaLiga"], country: "España", flag: "ESP", code: "LL", leagueId: "4335", badge: "https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png", accent: "red", description: "Técnica, identidad y grandes rivalidades." },
  { name: "Serie A", apiNames: ["Italian Serie A", "Serie A"], country: "Italia", flag: "ITA", code: "SA", leagueId: "4332", badge: "https://r2.thesportsdb.com/images/media/league/badge/67q3q21679951383.png", accent: "blue", description: "Tradición táctica y evolución competitiva." },
  { name: "Bundesliga", apiNames: ["German Bundesliga", "Bundesliga"], country: "Alemania", flag: "GER", code: "BL", leagueId: "4331", badge: "https://r2.thesportsdb.com/images/media/league/badge/teqh1b1679952008.png", accent: "crimson", description: "Estadios vibrantes y fútbol ofensivo." },
  { name: "Ligue 1", apiNames: ["French Ligue 1", "Ligue 1"], country: "Francia", flag: "FRA", code: "L1", leagueId: "4334", badge: "https://r2.thesportsdb.com/images/media/league/badge/9f7z9d1742983155.png", accent: "navy", description: "Talento joven y potencia atlética." },
  { name: "Primeira Liga", apiNames: ["Portuguese Primeira Liga", "Primeira Liga"], country: "Portugal", flag: "POR", code: "LP", leagueId: "4344", badge: "https://r2.thesportsdb.com/images/media/league/badge/3tgdke1782689102.png", accent: "green", description: "Formación, técnica y clubes históricos." },
];

const teams = [
  { id: 1, apiId: "133604", club: "Arsenal", league: "Premier League", country: "Inglaterra", city: "Londres", stadium: "Emirates Stadium", founded: 1886, europeanTitles: 0, badge: "https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png", dataSource: "TheSportsDB" },
  { id: 2, apiId: "133738", club: "Real Madrid", league: "LaLiga", country: "España", city: "Madrid", stadium: "Santiago Bernabéu", founded: 1902, europeanTitles: 15, badge: "https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png", dataSource: "TheSportsDB" },
  { id: 3, apiId: "133681", club: "Inter de Milán", league: "Serie A", country: "Italia", city: "Milán", stadium: "Giuseppe Meazza", founded: 1908, europeanTitles: 3, badge: "https://r2.thesportsdb.com/images/media/team/badge/ryhu6d1617113103.png", dataSource: "TheSportsDB" },
  { id: 4, apiId: "133664", club: "Bayern Múnich", league: "Bundesliga", country: "Alemania", city: "Múnich", stadium: "Allianz Arena", founded: 1900, europeanTitles: 6, badge: "https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png", dataSource: "TheSportsDB" },
  { id: 5, club: "Paris Saint-Germain", league: "Ligue 1", country: "Francia", city: "París", stadium: "Parc des Princes", founded: 1970, europeanTitles: 1, badge: "", dataSource: "Manual" },
  { id: 6, apiId: "134108", club: "Benfica", league: "Primeira Liga", country: "Portugal", city: "Lisboa", stadium: "Estádio da Luz", founded: 1904, europeanTitles: 2, badge: "https://r2.thesportsdb.com/images/media/team/badge/hj4kyc1781152436.png", dataSource: "TheSportsDB" },
];

const normalize = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const sanitizeBadgeUrl = (value = "") => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)thesportsdb\.com$/i.test(url.hostname) ? url.href : "";
  } catch {
    return "";
  }
};

const cityFromLocation = (location = "") => {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  const countryNames = ["england", "spain", "italy", "germany", "france", "portugal", "unitedkingdom"];
  const lastPartIsCountry = countryNames.includes(normalize(parts.at(-1)));
  return (lastPartIsCountry ? parts.at(-2) : parts.at(-1)) || "";
};

const findTeamInApi = async (clubName, leagueName) => {
  if (process.env.DISABLE_TEAM_API === "1") return null;
  const league = leagues.find((item) => item.name === leagueName);
  if (!league) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${SPORTS_DB_URL}?t=${encodeURIComponent(clubName)}`, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "Nexa-European-Football-Lab/1.0" },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const candidates = Array.isArray(payload.teams) ? payload.teams.filter((team) => team.strSport === "Soccer") : [];
    const apiNames = league.apiNames.map(normalize);
    const match = candidates.find((team) => apiNames.includes(normalize(team.strLeague)));
    if (!match) return null;
    return {
      apiId: String(match.idTeam || ""), club: match.strTeam || clubName, league: league.name,
      country: league.country, city: cityFromLocation(match.strLocation), stadium: match.strStadium || "",
      founded: Number(match.intFormedYear) || "", badge: sanitizeBadgeUrl(match.strBadge || match.strTeamBadge),
      dataSource: "TheSportsDB",
    };
  } catch (error) {
    if (error.name !== "AbortError") console.warn("No se pudo consultar TheSportsDB:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const renderIndex = (res, values = {}) => res.render("teams", {
  title: "Clubes de Europa", currentPath: "/teams", leagues, teams: [...teams].reverse(),
  created: false, deleted: false, apiFound: false, ...values,
});

const index = (req, res) => renderIndex(res, {
  created: req.query.created === "1", deleted: req.query.deleted === "1", apiFound: req.query.source === "api",
});

const searchTeam = async (req, res) => {
  const club = req.query.club?.trim();
  const league = req.query.league?.trim();
  if (!club || !league) return res.status(400).json({ error: "Escriba un club y seleccione su liga." });
  if (!leagues.some((item) => item.name === league)) return res.status(400).json({ error: "La liga seleccionada no es válida." });
  const team = await findTeamInApi(club, league);
  if (!team) return res.status(404).json({ error: "No encontramos ese club en la liga seleccionada. Puede completar los datos manualmente." });
  return res.json({ team, provider: "TheSportsDB" });
};

const store = async (req, res) => {
  const fields = {
    club: req.body.club?.trim(), league: req.body.league?.trim(), country: req.body.country?.trim(),
    city: req.body.city?.trim(), stadium: req.body.stadium?.trim(), founded: req.body.founded?.trim(),
    europeanTitles: req.body.europeanTitles?.trim(), badge: sanitizeBadgeUrl(req.body.badge), apiId: req.body.apiId?.trim(),
  };
  const required = ["club", "league", "city", "stadium", "founded", "europeanTitles"];
  if (required.some((key) => !fields[key])) return renderIndex(res.status(400), { error: "Busque el club en la API o complete todos los campos obligatorios.", form: fields });
  const league = leagues.find((item) => item.name === fields.league);
  if (!league) return renderIndex(res.status(400), { error: "Seleccione una de las seis ligas disponibles.", form: fields });
  const apiTeam = await findTeamInApi(fields.club, fields.league);
  const founded = Number(apiTeam?.founded || fields.founded);
  const europeanTitles = Number(fields.europeanTitles);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(founded) || founded < 1800 || founded > currentYear || !Number.isInteger(europeanTitles) || europeanTitles < 0) {
    return renderIndex(res.status(400), { error: "Revise el año de fundación y la cantidad de títulos europeos.", form: fields });
  }
  const nextId = teams.reduce((max, team) => Math.max(max, team.id), 0) + 1;
  const team = {
    id: nextId, apiId: apiTeam?.apiId || fields.apiId || "", club: apiTeam?.club || fields.club,
    league: league.name, country: league.country, city: apiTeam?.city || fields.city,
    stadium: apiTeam?.stadium || fields.stadium, founded, europeanTitles,
    badge: apiTeam?.badge || fields.badge, dataSource: apiTeam ? "TheSportsDB" : "Manual",
  };
  teams.push(team);
  console.log("Nuevo club europeo registrado:", team);
  return res.redirect(`/teams?created=1&source=${apiTeam ? "api" : "manual"}`);
};

const deleteTeam = (req, res) => {
  const id = Number(req.params.id);
  const indexToDelete = teams.findIndex((team) => team.id === id);
  if (indexToDelete === -1) return res.status(404).render("notFound", { title: "Club no encontrado", currentPath: "/teams", url: req.originalUrl });
  teams.splice(indexToDelete, 1);
  return res.redirect("/teams?deleted=1");
};

module.exports = { index, searchTeam, store, deleteTeam };
