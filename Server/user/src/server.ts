import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

connectDB();

connectRabbitMQ()

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().then(() => {
  console.log("Connected to Redis");
}).catch((err) => {
  console.log("Redis Client Error", err);
});

const app = express();

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});