const multer = require("multer");

// Associe les fichiers à leur extension

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Crée un objet storage (défini comment multer doit stocker les fichiers téléchargés), précise le dossier de destination de ces fichiers ainsi que les noms qui leur seront attribués

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); // Remplace les espaces par des _
    const extension = MIME_TYPES[file.mimetype]; // détermine l'extension du fichier à partir de son type MIME
    callback(null, name.split(".")[0] + Date.now() + "." + extension); // Prend la 1ère partie avant le point, ajoute le timestamp et .extension
  },
});

module.exports = multer({ storage: storage }).single("image");
