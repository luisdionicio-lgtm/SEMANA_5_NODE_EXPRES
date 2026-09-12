const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const mainRoutes = require("./routes/mainRoutes");
app.use("/", mainRoutes);

app.use((req, res) => {
  res.status(404).render("notFound", {
    title: "Página no encontrada",
    currentPath: "",
    url: req.originalUrl,
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
}

module.exports = app;
