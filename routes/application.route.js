import { Router } from "express";
import {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    getApplicationById,
    updateStatus
} from "../controllers/application.controller.js";
import protect from "../middlewares/auth.js";

const ApplicationRouter = Router();

ApplicationRouter.post("/:jobId", protect, applyToJob);
ApplicationRouter.get("/my", protect, getMyApplications);
ApplicationRouter.get("/job/:jobId", protect, getApplicantsForJob);
ApplicationRouter.get("/:id", protect, getApplicationById);
ApplicationRouter.put("/:id/status", protect, updateStatus);


export default ApplicationRouter;