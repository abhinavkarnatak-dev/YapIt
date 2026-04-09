import express from "express";
import dotenv from "dotenv";
import { startConnectionRequestConsumer, startSendingOTPConsumer, startConnectionAcceptedConsumer } from "./consumer.js";
dotenv.config();
startSendingOTPConsumer();
startConnectionRequestConsumer();
startConnectionAcceptedConsumer();
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
