import express, { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import upload from "../middlewares/upload.js";
import project from "../middlewares/auth.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", project, getMe);

authRoutes.post("/upload-image", upload.single("image"), (req, res) => {
  // 1. Vérifie si un fichier a bien été téléchargé
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  // 2. Construit l'URL de l'image
  // 'req.protocol' est 'http' ou 'https'
  // 'req.get('host')' est 'localhost:5000' ou ton nom de domaine
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  // 3. Renvoie la réponse avec l'URL de l'image
  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    imageUrl,
  });
});

export default authRoutes;
