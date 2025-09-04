import express, { Router } from "express";
import project from "../middlewares/auth.js";
import { updateProfile, deleteResume, getPublicProfile } from '../controllers/user.controller.js';

const userRoutes = Router()

//protected route
userRoutes.put('/profile', project, updateProfile)
userRoutes.delete('/resume', project, deleteResume)

//public route
userRoutes.get('/:id', getPublicProfile)

export default userRoutes