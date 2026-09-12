const assert = require("node:assert/strict");
const test = require("node:test");

const app = require("../app");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET / renderiza la página de inicio", async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Arquitectura clara/);
  assert.match(body, /href="\/about"/);
});

test("GET /about renderiza la página acerca de", async () => {
  const response = await fetch(`${baseUrl}/about`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Separación de responsabilidades/);
  assert.match(body, /href="\/"/);
});

test("GET /contact muestra el formulario Materialize", async () => {
  const response = await fetch(`${baseUrl}/contact`);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(body, /action="\/contact" method="POST"/);
  assert.match(body, /materialize\/1\.0\.0/);
});

test("POST /contact registra un mensaje y redirige", async () => {
  const response = await fetch(`${baseUrl}/contact`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ nombre: "Usuario de prueba", email: "prueba@example.com", mensaje: "Mensaje del laboratorio" }),
    redirect: "manual",
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/contact?sent=1");
});

test("GET /admin muestra el mensaje registrado", async () => {
  const response = await fetch(`${baseUrl}/admin`);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(body, /Usuario de prueba/);
  assert.match(body, /Mensaje del laboratorio/);
});

test("POST /admin/messages/:id/update corrige el mensaje", async () => {
  const response = await fetch(`${baseUrl}/admin/messages/1/update`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      nombre: "Usuario corregido",
      email: "corregido@example.com",
      mensaje: "Contenido revisado por administración",
    }),
    redirect: "manual",
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/admin?updated=1");

  const adminResponse = await fetch(`${baseUrl}/admin?updated=1`);
  const body = await adminResponse.text();
  assert.match(body, /Usuario corregido/);
  assert.match(body, /Contenido revisado por administración/);
  assert.match(body, /Corregido por el administrador/);
  assert.match(body, /Mensaje corregido por el administrador/);
});

test("POST /admin/messages/:id/delete elimina el mensaje", async () => {
  const response = await fetch(`${baseUrl}/admin/messages/1/delete`, {
    method: "POST",
    redirect: "manual",
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/admin?deleted=1");

  const adminResponse = await fetch(`${baseUrl}/admin?deleted=1`);
  const body = await adminResponse.text();
  assert.doesNotMatch(body, /Usuario corregido/);
  assert.match(body, /Mensaje eliminado correctamente/);
});

test("una ruta inexistente devuelve la vista 404", async () => {
  const response = await fetch(`${baseUrl}/ruta-inexistente`);
  const body = await response.text();
  assert.equal(response.status, 404);
  assert.match(body, /La ruta solicitada no está disponible/);
});

test("GET /teams muestra las seis ligas y el formulario de siete campos", async () => {
  const response = await fetch(`${baseUrl}/teams`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /El pulso de las grandes ligas de Europa/);
  for (const league of ["Premier League", "LaLiga", "Serie A", "Bundesliga", "Ligue 1", "Primeira Liga"]) {
    assert.match(body, new RegExp(league));
  }
  for (const field of ["club", "league", "country", "city", "stadium", "founded", "europeanTitles"]) {
    assert.match(body, new RegExp(`name="${field}"`));
  }
});

test("POST /teams guarda un club en memoria y redirige", async () => {
  const response = await fetch(`${baseUrl}/teams`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      club: "Liverpool",
      league: "Premier League",
      country: "Inglaterra",
      city: "Liverpool",
      stadium: "Anfield",
      founded: "1892",
      europeanTitles: "6",
    }),
    redirect: "manual",
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/teams?created=1");
});

test("GET /teams muestra la tabla con el club creado", async () => {
  const response = await fetch(`${baseUrl}/teams`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Liverpool/);
  assert.match(body, /Anfield/);
  assert.match(body, /1892/);
});

test("POST /teams/:id/delete elimina el club creado", async () => {
  const response = await fetch(`${baseUrl}/teams/7/delete`, {
    method: "POST",
    redirect: "manual",
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/teams?deleted=1");

  const teamsResponse = await fetch(`${baseUrl}/teams`);
  const body = await teamsResponse.text();
  assert.doesNotMatch(body, /Anfield/);
});

test("GET /styles.css sirve el archivo estático", async () => {
  const response = await fetch(`${baseUrl}/styles.css`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /\.hero-grid/);
});
