const express = require("express");
const router = express.Router(); // création d'une instance de router Express, sera utilisé pour définir les routes spécifiques aux livres
const optimizedImg = require("../middleware/sharp-config");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestBook);
router.get("/:id", bookCtrl.getOneBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer, optimizedImg, bookCtrl.createBook);
router.put("/:id", auth, multer, optimizedImg, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
