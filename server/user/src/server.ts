import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

connectDB();
connectRabbitMQ();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  pingInterval: 1000 * 60 * 4,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) return new Error("Redis max retries reached");
      return Math.min(retries * 500, 3000);
    },
    keepAlive: true,
  },
});

redisClient.on("error", (err: Error) => {
  console.error("Redis Error:", err.message);
});

redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));
redisClient.on("ready", () => console.log("Redis ready"));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis initial connection failed:", (err as Error).message);
  }
})();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});