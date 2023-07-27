const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator(); // Création d'une nouvelle instance de passwordValidator
passwordSchema
  .is()
  .min(8)
  .is()
  .max(20)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

module.exports = (req, res, next) => {
  const userPassword = req.body.password; // Extrait le password du corps de la requête
  if (!passwordSchema.validate(userPassword)) {
    return res.status(400).json({
      error: `Mot de passe trop faible ${passwordSchema.validate(userPassword, {
        list: true, // Renvoi une liste des erreurs de validations spécifique
      })}`,
    });
  } else {
    next();
  }
};
