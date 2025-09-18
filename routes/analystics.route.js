import { Router } from "express";
import project from "../middlewares/auth.js";
import { getEmplyerAnalytics } from "../controllers/analystics.controller.js";


const analyticsRouter = Router();

analyticsRouter.get("/overview", project, getEmplyerAnalytics);

export default analyticsRouter;