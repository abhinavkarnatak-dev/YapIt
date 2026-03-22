import express from "express";
import dotenv from "dotenv";
import { startSendingOTPConsumer } from "./consumer.js";

dotenv.config();

startSendingOTPConsumer();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});