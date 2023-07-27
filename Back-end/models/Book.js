const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Schéma de modèle de données pour un livre

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, required: true },
});

bookSchema.plugin(uniqueValidator); // Ajout du plugin au schéma

module.exports = mongoose.model("Book", bookSchema); // Exporte le modèle Book basé sur Bookschema
