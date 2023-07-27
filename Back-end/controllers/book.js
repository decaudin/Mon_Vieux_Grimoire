const Book = require("../models/Book"); // Importation du modèle book
const fs = require("fs");

// Fonction pour créer un livre

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // Récupération du contenu JSON et transformation en objet JS
  delete bookObject._id; // Suppression de Id et userId
  delete bookObject._userId;
  const book = new Book({
    ...bookObject, // Création d'un nouvel objet book selon le schéma book et les propriétés de bookObject (syntaxe de propagation ...)
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename.split(".")[0]
    }optimized.webp`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré!" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour récupérer tous les livres

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour récupérer un livre

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id, // recherche avec findOne un livre spécifique en fonction de son ID dans la BDD, _id correspond au livre que nous cherchons
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un livre

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file // Si image dans la requête on combine les données du livre extraites du corps de la requête et l'image téléchargée
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename.split(".")[0]
        }optimized.webp`,
      }
    : { ...req.body }; // Si pas d'image on prends simplemet les données contenues dans le corps de la requête

  delete bookObject._userId; // Suppression car ne sera pas modifié
  Book.findOne({ _id: req.params.id }) // Recherche du livre dans la bdd
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" }); // Vérifie que l'utilisateur authentifié est bien celui qui a crée le livre
      } else {
        const isNewImageUploaded = req.file !== undefined; // Vérifie si une nouvelle img a été téléchargée avec la requête
        // Si true suppression de l'ancienne image
        if (isNewImageUploaded) {
          const oldImageUrl = book.imageUrl;
          const imageName = oldImageUrl.split("/images/")[1];
          fs.unlink(`images/${imageName}`, () => {
            console.log(`Ancienne image supprimée : ${imageName}`);
          });
        }

        // Mise à jour du livre (id indique quel livre doit etre mis à jour)

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            res.status(200).json({ message: "Objet modifié!" });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour supprimer un livre

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // Méthode findOne pour chercher un livre dans la BDD en fonction de son id
    .then((book) => {
      // Vérification si l'id du créateur du livre correspond à celui de l'utilisateur authentifié
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1]; // Récupération du nom du fichier de l'image associé au livre
        // Suppression de l'image du répertoire images avec unlink du module fs
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id }) // Suppression du livre dans la base de donnée avec l'id
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Fonction pour récupérer les 3 livres les mieux notés

exports.getBestBook = (req, res, next) => {
  Book.find() // Cherche tous les livres dans la bdd
    .sort({ averageRating: -1 }) // Trie les livres de manière décroissante en fonction du averagerating, du mieux au moins bien noté
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(401).json({ error }));
};

// Fonction pour noter un livre déja créé

exports.rateBook = async (req, res, next) => {
  const user = req.body.userId; // Récupère l'id du corps de la requête et le stocke dans la variable user
  // Vérifie si l'id de l'utilisateur authentifié est le même que celui qui souhaite noter le livre
  if (user !== req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const book = await Book.findOne({ _id: req.params.id }); // Recherche dans la BDD le livre en fonction de son Id
    // Vérifie si l'utilisateur a déja noté ce livre en cherchant son id dans la liste des évals du livre
    if (book.ratings.find((rating) => rating.userId === user)) {
      return res.status(401).json({ message: "Livre déjà noté" });
    }
    // Création d'un nouvel objet si l'utilisateur n'a pas encore noté ce livre
    const newRating = {
      userId: user,
      grade: req.body.rating,
      _id: req.body._id,
    };

    const updatedRatings = [...book.ratings, newRating]; // Rajoute la nouvelle notation à la liste existante des évaluations du livre

    // Fonction pour calculer la nouvelle moyenne du livre

    const calcAverageRating = (ratings) => {
      const sumRatings = ratings.reduce((total, rate) => total + rate.grade, 0);
      const average = sumRatings / ratings.length;
      return parseFloat(average.toFixed(2));
    };

    // Mise à jour de la nouvelle moyenne avec la fonction précédemment créé

    const updateAverageRating = calcAverageRating(updatedRatings);

    // Mise à jour du livre dans la base de donnée

    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id, "ratings.userId": { $ne: user } }, // Spécifie les critères de recherche
      { $push: { ratings: newRating }, averageRating: updateAverageRating }, // Ajout de newRating à ratings et de updateAverageRating à averageRating
      { new: true } // Renvoi du document mis à jour
    );

    res.status(201).json(updatedBook);
  } catch (error) {
    res.status(401).json({ error });
  }
};
