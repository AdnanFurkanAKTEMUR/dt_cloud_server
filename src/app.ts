import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/authRoutes";
import newsRoutes from "./routes/newsRoutes";
import filtersRoutes from "./routes/filtersRoutes";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/user", userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
