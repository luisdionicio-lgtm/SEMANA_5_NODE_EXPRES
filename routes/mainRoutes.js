const express = require("express");
const mainController = require("../controllers/mainController");
const teamController = require("../controllers/teamController");

const router = express.Router();

router.get("/", mainController.home);
router.get("/about", mainController.about);
router.get("/contact", mainController.contact);
router.post("/contact", mainController.saveContact);
router.get("/admin", mainController.admin);
router.post("/admin/messages/:id/update", mainController.updateMessage);
router.post("/admin/messages/:id/delete", mainController.deleteMessage);
router.get("/teams", teamController.index);
router.post("/teams", teamController.store);
router.post("/teams/:id/delete", teamController.deleteTeam);

module.exports = router;
