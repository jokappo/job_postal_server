import { Router } from "express";
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    toggleCloseJob,
    getJobEmployer
} from "../controllers/job.controller.js";
import project from "../middlewares/auth.js";

const jobsRoutes = Router();

jobsRoutes.route("/").post(project, createJob).get(getJobs);
jobsRoutes.route("/get-jobs-employer").get(project, getJobEmployer);
jobsRoutes.route("/:id").get(getJobById).put(project, updateJob).delete(project, deleteJob);
jobsRoutes.patch("/:id/toggle", project, toggleCloseJob);



export default jobsRoutes;
