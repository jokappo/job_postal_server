import UserModel from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname n'est pas disponible par défaut en ES modules, on le recrée
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Update user profile (name, avatar, company details)
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      resume,
      companyName,
      companyDescription,
      companyLogo,
    } = req.body;

    // Récupérer l'ID de l'utilisateur à partir de l'objet de requête (attaché par le middleware d'authentification)
    const userId = req.user._id;

    // Trouver l'utilisateur dans la base de données
    const user = await UserModel.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    // Mettre à jour les champs de base du profil
    // On utilise les valeurs du corps de la requête, ou on garde les anciennes si elles ne sont pas fournies.
    user.name = name ?? user.name;
    user.avatar = avatar ?? user.avatar;

    // Mettre à jour les champs spécifiques en fonction du rôle
    if (user.role === "employer") {
      // Mettre à jour les informations de l'entreprise
      user.companyName = companyName ?? user.companyName;
      user.companyDescription = companyDescription ?? user.companyDescription;
      user.companyLogo = companyLogo ?? user.companyLogo;
    } else if (user.role === "jobseeker") {
      // Mettre à jour le CV du chercheur d'emploi
      user.resume = resume ?? user.resume;
    }

    // Sauvegarder les modifications
    await user.save();

    // Renvoyer les données de l'utilisateur mis à jour
    // On peut formater la réponse pour ne renvoyer que les champs désirés
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume,
    };

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//@desc   Delete user resume file (jobseeker only)
export const deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    // Récupérer l'ID de l'utilisateur à partir du jeton d'authentification
    const userId = req.user._id;

    // Trouver l'utilisateur dans la base de données
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    // 1. Vérifier le rôle de l'utilisateur
    if (user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Seul un chercheur d'emploi peut supprimer un CV.",
      });
    }

    // 2. Vérifier si l'utilisateur a bien un CV à supprimer
    if (!user.resume) {
      return res.status(400).json({
        success: false,
        message: "Aucun CV à supprimer pour cet utilisateur.",
      });
    }

    // 3. Extraire le nom du fichier du chemin complet du CV
    const fileName = resumeUrl.split("/").pop();

    // 4. Construire le chemin absolu du fichier pour éviter les failles de sécurité
    const filepath = path.resolve(__dirname, "../uploads", fileName);

    // 5. Supprimer le fichier physiquement du disque
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error("Erreur lors de la suppression du fichier :", err);
      }
    });

    // 6. Mettre à jour le champ du CV de l'utilisateur dans la base de données
    user.resume = "";
    await user.save();

    // 7. Renvoyer une réponse de succès au client
    return res.status(200).json({
      success: true,
      message: "Le CV a été supprimé avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc   Get user public profile
export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Utilisation de 'id' au lieu de '_id'

    // 1. Vérifiez si l'ID utilisateur est fourni
    if (!userId) {
      return res.status(400).json({
        // Utilisation de 400 pour une mauvaise requête
        success: false,
        message: "L'ID utilisateur est requis.",
      });
    }

    // 2. Trouvez l'utilisateur de manière asynchrone et excluez le mot de passe
    const user = await UserModel.findById(userId).select("-password");

    // 3. Vérifiez si l'utilisateur a été trouvé
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    // 4. Renvoie le profil public
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // 5. Gère les erreurs serveur
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};
