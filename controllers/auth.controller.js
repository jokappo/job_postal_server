import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

//@desc    Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;

    // 1. Validation de base des champs
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Veuillez remplir tous les champs obligatoires.",
      });
    }

    // 2. Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà enregistré.",
      });
    }

    // 3. Créer le nouvel utilisateur
    const newUser = await User.create({
      name,
      email,
      password, // Le hachage est géré par le middleware `pre-save` dans le modèle.
      avatar,
      role,
    });

    // 4. Si l'utilisateur est créé avec succès, renvoyer les données et le token
    if (newUser) {
      // Préparer les données de réponse en fonction du rôle
      let responseData = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        token: generateToken(newUser._id),
      };

      // Si c'est une entreprise, ajouter les champs spécifiques à la réponse
      if (newUser.role === "employer") {
        responseData = {
          ...responseData,
          companyName: newUser.companyName || "",
          companyDescription: newUser.companyDescription || "",
          companyLogo: newUser.companyLogo || "",
        };
      }

      // Si c'est un chercheur d'emploi, ajouter les champs spécifiques
      if (newUser.role === "jobseeker") {
        responseData = {
          ...responseData,
          resume: newUser.resume || "",
          // ... tu peux ajouter d'autres champs comme les compétences, le portfolio, etc.
        };
      }

      return res.status(201).json({
        success: true,
        message: "Utilisateur enregistré avec succès.",
        data: responseData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Données utilisateur invalides.",
      });
    }
  } catch (error) {
    // Gestion des erreurs de validation (par exemple, données incorrectes)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    // Gestion des autres erreurs du serveur
    return res.status(500).json({
      success: false,
      message: "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc    Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email et un mot de passe.",
      });
    }

    // 2. Vérifier si l'utilisateur existe et si le mot de passe est correct
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    // 3. Si les identifiants sont valides, préparer les données de réponse
    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    };

    // 4. Ajouter des champs spécifiques en fonction du rôle de l'utilisateur
    if (user.role === "employer") {
      responseData = {
        ...responseData,
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
      };
    } else if (user.role === "jobseeker") {
      responseData = {
        ...responseData,
        resume: user.resume || "",
      };
    }

    // 5. Renvoyer la réponse
    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc    Get user data
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      error: false,
      success: true,
      data: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
