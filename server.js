import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import jobsRoutes from "./routes/job.route.js";
import ApplicationRouter from "./routes/application.route.js";
import saveJobRouter from "./routes/savedjob.route.js";
import analyticsRouter from "./routes/analystics.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware cors
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// connect db
connectDB();

// middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", ApplicationRouter);
app.use("/api/saved-jobs", saveJobRouter);
app.use("/api/analytics", analyticsRouter);

// serve upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
