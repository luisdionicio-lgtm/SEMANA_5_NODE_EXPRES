const leagues = [
  { name: "Premier League", country: "Inglaterra", code: "PL", accent: "violet", description: "Intensidad, ritmo y alcance global." },
  { name: "LaLiga", country: "España", code: "LL", accent: "red", description: "Técnica, identidad y grandes rivalidades." },
  { name: "Serie A", country: "Italia", code: "SA", accent: "blue", description: "Tradición táctica y evolución competitiva." },
  { name: "Bundesliga", country: "Alemania", code: "BL", accent: "crimson", description: "Estadios vibrantes y fútbol ofensivo." },
  { name: "Ligue 1", country: "Francia", code: "L1", accent: "navy", description: "Talento joven y potencia atlética." },
  { name: "Primeira Liga", country: "Portugal", code: "LP", accent: "green", description: "Formación, técnica y clubes históricos." },
];

const teams = [
  { id: 1, club: "Arsenal", league: "Premier League", country: "Inglaterra", city: "Londres", stadium: "Emirates Stadium", founded: 1886, europeanTitles: 0 },
  { id: 2, club: "Real Madrid", league: "LaLiga", country: "España", city: "Madrid", stadium: "Santiago Bernabéu", founded: 1902, europeanTitles: 15 },
  { id: 3, club: "Inter de Milán", league: "Serie A", country: "Italia", city: "Milán", stadium: "Giuseppe Meazza", founded: 1908, europeanTitles: 3 },
  { id: 4, club: "Bayern Múnich", league: "Bundesliga", country: "Alemania", city: "Múnich", stadium: "Allianz Arena", founded: 1900, europeanTitles: 6 },
  { id: 5, club: "Paris Saint-Germain", league: "Ligue 1", country: "Francia", city: "París", stadium: "Parc des Princes", founded: 1970, europeanTitles: 1 },
  { id: 6, club: "Benfica", league: "Primeira Liga", country: "Portugal", city: "Lisboa", stadium: "Estádio da Luz", founded: 1904, europeanTitles: 2 },
];

const index = (req, res) => {
  res.render("teams", {
    title: "Clubes de Europa",
    currentPath: "/teams",
    leagues,
    teams: [...teams].reverse(),
    created: req.query.created === "1",
    deleted: req.query.deleted === "1",
  });
};

const store = (req, res) => {
  const fields = {
    club: req.body.club?.trim(),
    league: req.body.league?.trim(),
    country: req.body.country?.trim(),
    city: req.body.city?.trim(),
    stadium: req.body.stadium?.trim(),
    founded: req.body.founded?.trim(),
    europeanTitles: req.body.europeanTitles?.trim(),
  };

  if (Object.values(fields).some((value) => value === undefined || value === "")) {
    return res.status(400).render("teams", {
      title: "Clubes de Europa",
      currentPath: "/teams",
      leagues,
      teams: [...teams].reverse(),
      created: false,
      deleted: false,
      error: "Complete los siete campos para registrar el club.",
      form: fields,
    });
  }

  const founded = Number(fields.founded);
  const europeanTitles = Number(fields.europeanTitles);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(founded) || founded < 1800 || founded > currentYear || !Number.isInteger(europeanTitles) || europeanTitles < 0) {
    return res.status(400).render("teams", {
      title: "Clubes de Europa",
      currentPath: "/teams",
      leagues,
      teams: [...teams].reverse(),
      created: false,
      deleted: false,
      error: "Revise el año de fundación y la cantidad de títulos europeos.",
      form: fields,
    });
  }

  const league = leagues.find((item) => item.name === fields.league);
  if (!league) {
    return res.status(400).render("teams", {
      title: "Clubes de Europa",
      currentPath: "/teams",
      leagues,
      teams: [...teams].reverse(),
      created: false,
      deleted: false,
      error: "Seleccione una de las seis ligas disponibles.",
      form: fields,
    });
  }

  const nextId = teams.reduce((max, team) => Math.max(max, team.id), 0) + 1;
  const team = { id: nextId, ...fields, country: league.country, founded, europeanTitles };
  teams.push(team);
  console.log("Nuevo club europeo registrado:", team);
  return res.redirect("/teams?created=1");
};

const deleteTeam = (req, res) => {
  const id = Number(req.params.id);
  const indexToDelete = teams.findIndex((team) => team.id === id);

  if (indexToDelete === -1) {
    return res.status(404).render("notFound", {
      title: "Club no encontrado",
      currentPath: "/teams",
      url: req.originalUrl,
    });
  }

  teams.splice(indexToDelete, 1);
  return res.redirect("/teams?deleted=1");
};

module.exports = { index, store, deleteTeam };
