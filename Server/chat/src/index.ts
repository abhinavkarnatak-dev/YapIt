import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";

dotenv.config();

connectDB();

import { app, server } from "./socket.js";

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = process.env.PORT || 3001;

app.use("/api/v1", chatRoutes);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});