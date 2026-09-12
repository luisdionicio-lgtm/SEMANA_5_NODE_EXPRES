const messages = [];

const home = (req, res) => {
  res.render("home", { title: "Inicio", currentPath: "/" });
};

const about = (req, res) => {
  res.render("about", { title: "Acerca de", currentPath: "/about" });
};

const contact = (req, res) => {
  res.render("contact", {
    title: "Contacto",
    currentPath: "/contact",
    sent: req.query.sent === "1",
  });
};

const saveContact = (req, res) => {
  const nombre = req.body.nombre?.trim();
  const email = req.body.email?.trim();
  const mensaje = req.body.mensaje?.trim();

  if (!nombre || !email || !mensaje) {
    return res.status(400).render("contact", {
      title: "Contacto",
      currentPath: "/contact",
      sent: false,
      error: "Todos los campos son obligatorios.",
      form: { nombre, email, mensaje },
    });
  }

  const record = {
    id: messages.length + 1,
    nombre,
    email,
    mensaje,
    receivedAt: new Intl.DateTimeFormat("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Lima",
    }).format(new Date()),
  };

  messages.push(record);
  console.log("Nuevo mensaje recibido:", record);
  return res.redirect("/contact?sent=1");
};

const admin = (req, res) => {
  res.render("admin", {
    title: "Administración",
    currentPath: "/admin",
    messages: [...messages].reverse(),
    updated: req.query.updated === "1",
    deleted: req.query.deleted === "1",
  });
};

const updateMessage = (req, res) => {
  const id = Number(req.params.id);
  const message = messages.find((item) => item.id === id);

  if (!message) {
    return res.status(404).render("notFound", {
      title: "Mensaje no encontrado",
      currentPath: "/admin",
      url: req.originalUrl,
    });
  }

  const nombre = req.body.nombre?.trim();
  const email = req.body.email?.trim();
  const mensaje = req.body.mensaje?.trim();

  if (!nombre || !email || !mensaje) {
    return res.status(400).render("admin", {
      title: "Administración",
      currentPath: "/admin",
      messages: [...messages].reverse(),
      updated: false,
      deleted: false,
      error: "No se puede guardar una corrección con campos vacíos.",
    });
  }

  Object.assign(message, {
    nombre,
    email,
    mensaje,
    correctedByAdmin: true,
    correctedAt: new Intl.DateTimeFormat("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Lima",
    }).format(new Date()),
  });

  console.log("Mensaje corregido por el administrador:", message);
  return res.redirect("/admin?updated=1");
};

const deleteMessage = (req, res) => {
  const id = Number(req.params.id);
  const index = messages.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).render("notFound", {
      title: "Mensaje no encontrado",
      currentPath: "/admin",
      url: req.originalUrl,
    });
  }

  const [removed] = messages.splice(index, 1);
  console.log("Mensaje eliminado por el administrador:", removed);
  return res.redirect("/admin?deleted=1");
};

module.exports = {
  home,
  about,
  contact,
  saveContact,
  admin,
  updateMessage,
  deleteMessage,
};
