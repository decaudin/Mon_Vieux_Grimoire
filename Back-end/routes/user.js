const express = require("express");
const router = express.Router();
const validEmail = require("../middleware/email-validator");
const validPassword = require("../middleware/password-validator");
const userCtrl = require("../controllers/user");

// Limite les tentatives de connexion pour éviter les attaques force brute

const rateLimit = require("express-rate-limit");
const limitUserLogin = rateLimit({
  windowMs: 5 * 60 * 1000, // équivaut à 5min
  max: 50,
  message: "Vous avez effectué trop de tentatives de connexion",
});

// Définit les routes pour l'inscription et la connexion, associe les fonctions de contrôleurs appropriées à la méthode HTTP POST correspondante.

router.post("/signup", validEmail, validPassword, userCtrl.signup);
router.post("/login", limitUserLogin, userCtrl.login);

module.exports = router;
