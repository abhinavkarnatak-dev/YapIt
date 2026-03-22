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
                    channel.nack(msg);
                }
            }
        });
    }
    catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
};
