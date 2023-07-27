const mongoose = require("mongoose"); // Importation de mongoose - facilite l'interraction avec MongoDB
const uniqueValidator = require("mongoose-unique-validator"); // Importation du Plugin Mongoose - ajout d'une validation supplémentaire pour s'assurer que les champs uniques sont uniques dans la BDD

// Schéma de modèle de données pour un utilisateur

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // Ajout du plugin au schéma

module.exports = mongoose.model("User", userSchema); // Exportation du modèle d'utilisation créé à partir du schéma
