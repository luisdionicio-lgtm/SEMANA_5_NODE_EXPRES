# Nexa Studio European Football Index

Aplicación web del laboratorio de Desarrollo de Aplicaciones Web Avanzado, desarrollada con Node.js, Express, EJS y Materialize CSS.

## Funcionalidades

- Inicio y página informativa.
- Formulario de contacto con almacenamiento en memoria.
- Panel administrativo para agregar, editar y eliminar mensajes.
- Etiqueta para mensajes corregidos por el administrador.
- Página 404 personalizada.
- Módulo de clubes de fútbol europeo con controlador independiente.
- Carrusel de seis ligas europeas.
- Formulario de siete campos para registrar clubes.
- Tabla responsive con los equipos guardados en memoria.
- Eliminación de clubes con confirmación.
- Consulta de clubes en la API pública TheSportsDB.
- Autocompletado de ciudad, estadio y año de fundación.
- Escudos oficiales y emblemas visuales para clubes y ligas.

## Ligas incluidas

- Premier League
- LaLiga
- Serie A
- Bundesliga
- Ligue 1
- Primeira Liga

## Instalación

```bash
npm install
npm start
```

Abra `http://localhost:3000` en el navegador.

En **Clubes**, escriba el nombre oficial del equipo, seleccione una liga y pulse
**Buscar club y autocompletar**. La aplicación usa el endpoint público de
TheSportsDB y permite completar los datos manualmente si el servicio no encuentra
una coincidencia.

## Pruebas

```bash
npm test
```

Los datos se almacenan en memoria y se restablecen cuando se reinicia el servidor.
