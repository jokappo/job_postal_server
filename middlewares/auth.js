import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware pour protéger les routes
const project = async (req, res, next) => {
  try {
    let token;

    // Vérifier si un token existe dans les headers de la requête
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      // Extraire le token (enlever "Bearer ")
      token = req.headers.authorization.split(" ")[1];
    }

    // Si aucun token n'est trouvé, renvoyer une erreur d'authentification
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé : aucun jeton fourni",
      });
    }

    // Vérifier le token et décoder le payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Si le décodage échoue, renvoyer une erreur d'authentification
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé : jeton invalide",
      });
    }

    // Trouver l'utilisateur dans la base de données et l'attacher à l'objet de requête
    const user = await User.findById(decoded.id).select("-password");

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Attacher l'utilisateur à la requête pour un accès facile dans les routes
    req.user = user;
    
    // Passer au prochain middleware ou au contrôleur
    next();
  } catch (error) {
    // Gérer les erreurs de vérification du jeton (par exemple, jeton expiré)
    return res.status(401).json({
      success: false,
      error: error.message,
      message: "Accès non autorisé : la vérification du jeton a échoué",
    });
  }
};

export default project;