// Ce fichier sert à créer un serveur HTTP qui écoute les requêtes entrantes sur un port spécifié ou à défaut le port 4000 et gère les erreurs éventuelles liées à l'écoute du port.

const http = require("http");
const app = require("./app");

// Vérifie si le port spécifié est valide

const normalizePort = (val) => {
  const port = parseInt(val, 10); // Tente de convertir la valeur de val en un nombre entier

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "4000"); // Définit le port en utilisant une variable 'PORT' si elle est définit, sinon il utilisera par défaut '4000'.
app.set("port", port); // On définit dans app.js la valeur du port

// Fonction qui gère les erreurs liées à l'écoute du port par le serveur

// Si l'erreur ne provient pas de l'écoute elle est renvoyée

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  // Messages d'erreur appropriés affichés selon le code d'erreur spécifique

  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app); // Création du serveur HTTP

server.on("error", errorHandler); // Rattachement de l'écouteur 'errorHandler' aux évènements d'erreur du serveur

// Rattachement d'un écouteur pour l'évènement 'listening', déclenché lorsque le serveur commence à écouter les connexions.

server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

server.listen(port);
