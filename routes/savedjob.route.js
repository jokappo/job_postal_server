import { Router } from "express";
import project from "../middlewares/auth.js";
import {
  saveJob,
  unsaveJob,
  getMySavedJobs,
} from "../controllers/savedjob.controller.js";

const saveJobRouter = Router();

saveJobRouter.post("/:jobId", project, saveJob);
saveJobRouter.delete("/:jobId", project, unsaveJob);
saveJobRouter.get("/my", project, getMySavedJobs);

export default saveJobRouter;
