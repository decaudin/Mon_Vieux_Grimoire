const express = require("express"); // Module Express, framework web pour Node.js
const mongoose = require("mongoose"); // facilite l'interaction avec la base de données MongoDB
const bodyParser = require("body-parser"); // permet de traiter les données des requêtes HTTP
const cors = require("cors");
const app = express(); // crée une instance d'Express et l'assigne à la variable app
const userRoutes = require("./routes/user"); // routes pour utilisateurs
const bookRoutes = require("./routes/book"); // routes pour livres
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const dotEnv = require("dotenv").config({ path: "./.env" }); // Importation du dotenv pour sécuriser la BDD

// Récupération des valeurs des variables depuis le dotenv et connexion avec MongoDB

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Autorisation de toutes les requêtes depuis n'importe quel domaine
  res.setHeader(
    "Access-Control-Allow-Headers", // Spécifie les en-têtes acceptés dans les requêtes
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods", // Autorise les méthodes HTTP suivantes
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(mongoSanitize()); // Protège contre les attaques par injection de mongoDb

// Helmet

app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
  })
);
app.use(bodyParser.json()); // Ajout du middleware body-parser pour analyser le corps des requêtes HTTP au format JSON.
app.use(cors());

// Définition des routes de l'API

app.use("/api/auth", userRoutes); // Les requêtes HTTP commençant par /api/auth seront gérées par les routes définies dans le module userRoutes
app.use("/api/books", bookRoutes); // Celles commençant par /api/books seront gérées par les routes définies dans le module bookRoutes
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
