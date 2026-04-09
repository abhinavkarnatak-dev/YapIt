import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendingOTPConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail Service Consumer is running and waiting for OTP messages...");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, otp } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });
                    await transporter.sendMail({
                        from: "YapIt",
                        to,
                        subject: "Your OTP for YapIt",
                        html: `<div style="font-family:sans-serif;">
                                    <h2>Verify your email</h2>
                                    <p>Your OTP for verifying your account on <b>YapIt</b> is:</p>
                                    <h3 style="color:#4f46e5;">${otp}</h3>
                                    <p>This OTP is valid for 5 minutes. If you didn't request this, please ignore.</p>
                                </div>`,
                    });
                    console.log(`OTP sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.log("Error sending OTP", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
};
export const startConnectionRequestConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        const queueName = "send-connection-req";
        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail Service Consumer is running and waiting for Connection Requests...");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, senderName } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });
                    await transporter.sendMail({
                        from: "YapIt",
                        to,
                        subject: "New Connection Request on YapIt",
                        html: `<div style="font-family:sans-serif;">
                                    <h2>You have received a connection request!</h2>
                                    <p><b>${senderName || 'Someone'}</b> wants to connect with you on <b>YapIt</b>.</p>
                                    <p>To accept the request and start chatting, please open the YapIt app.</p>
                                </div>`,
                    });
                    console.log(`Connection request email sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.log("Error sending connection request email", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
};
export const startConnectionAcceptedConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        const queueName = "send-connection-accepted";
        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail Service Consumer is running and waiting for Connection Acceptance...");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, acceptedByName } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });
                    await transporter.sendMail({
                        from: "YapIt",
                        to,
                        subject: "Connection Request Accepted!",
                        html: `<div style="font-family:sans-serif;">
                                    <h2>You have a new connection!</h2>
                                    <p><b>${acceptedByName || 'Someone'}</b> has accepted your connection request on <b>YapIt</b>.</p>
                                    <p>You can now start chatting with them in the app.</p>
                                </div>`,
                    });
                    console.log(`Connection acceptance email sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.log("Error sending connection acceptance email", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
};
