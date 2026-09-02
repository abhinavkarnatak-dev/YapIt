import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

const RECONNECT_DELAY = 5000;

let connection: AmqpConnection | null = null;
let channel: amqp.Channel | null = null;
let connecting = false;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    pool: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

type Consumer = {
    queue: string;
    label: string;
    build: (payload: any) => { to: string; subject: string; html: string };
};

const consumers: Consumer[] = [
    {
        queue: "send-otp",
        label: "OTP messages",
        build: ({ to, otp }) => ({
            to,
            subject: "Your OTP for YapIt",
            html: `<div style="font-family:sans-serif;">
                        <h2>Verify your email</h2>
                        <p>Your OTP for verifying your account on <b>YapIt</b> is:</p>
                        <h3 style="color:#4f46e5;">${otp}</h3>
                        <p>This OTP is valid for 5 minutes. If you didn't request this, please ignore.</p>
                    </div>`,
        }),
    },
    {
        queue: "send-connection-req",
        label: "Connection Requests",
        build: ({ to, senderName }) => ({
            to,
            subject: "New Connection Request on YapIt",
            html: `<div style="font-family:sans-serif;">
                        <h2>You have received a connection request!</h2>
                        <p><b style="color:#4f46e5;">${senderName || 'Someone'}</b> wants to connect with you on <b>YapIt</b>.</p>
                        <p>To accept the request and start chatting, please open the YapIt app.</p>
                    </div>`,
        }),
    },
    {
        queue: "send-connection-accepted",
        label: "Connection Acceptance",
        build: ({ to, acceptedByName }) => ({
            to,
            subject: "Connection Request Accepted!",
            html: `<div style="font-family:sans-serif;">
                        <h2>You have a new connection!</h2>
                        <p><b style="color:#4f46e5;">${acceptedByName || 'Someone'}</b> has accepted your connection request on <b>YapIt</b>.</p>
                        <p>You can now start chatting with them in the app.</p>
                    </div>`,
        }),
    },
];

const register = async (ch: amqp.Channel, consumer: Consumer) => {
    await ch.assertQueue(consumer.queue, { durable: true });

    await ch.consume(consumer.queue, async (msg) => {
        if (!msg) return;

        try {
            const { to, subject, html } = consumer.build(JSON.parse(msg.content.toString()));
            await transporter.sendMail({ from: "YapIt", to, subject, html });
            console.log(`Mail sent to ${to} (${consumer.queue})`);
            ch.ack(msg);
        } catch (error) {
            console.log(`Error handling ${consumer.queue}`, error);
            ch.nack(msg, false, false);
        }
    });

    console.log(`Mail Service Consumer is running and waiting for ${consumer.label}...`);
};

const scheduleReconnect = () => {
    setTimeout(() => {
        startConsumers();
    }, RECONNECT_DELAY);
};

export const startConsumers = async (): Promise<void> => {
    if (connecting || channel) return;
    connecting = true;

    let conn: AmqpConnection | null = null;

    try {
        conn = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
            heartbeat: 30,
        });

        // Without this listener an emitted 'error' is an unhandled error event,
        // which takes the whole process down.
        conn.on("error", (err) => {
            console.log("RabbitMQ connection error:", err.message);
        });

        // RabbitMQ blocks publishers on a disk or memory alarm without closing
        // the connection - publishes just silently buffer unless we log this.
        conn.on("blocked", (reason) => {
            console.log("RabbitMQ has BLOCKED publishers:", reason);
        });

        conn.on("unblocked", () => {
            console.log("RabbitMQ has unblocked publishers");
        });

        const ch = await conn.createChannel();
        await ch.prefetch(1);

        ch.on("error", (err) => {
            console.log("RabbitMQ channel error:", err.message);
        });

        for (const consumer of consumers) {
            await register(ch, consumer);
        }

        conn.on("close", () => {
            console.log(`RabbitMQ connection closed, reconnecting in ${RECONNECT_DELAY}ms`);
            connection = null;
            channel = null;
            connecting = false;
            scheduleReconnect();
        });

        connection = conn;
        channel = ch;
        connecting = false;
        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.log(`RabbitMQ connection failed, retrying in ${RECONNECT_DELAY}ms:`, (error as Error).message);

        // The 'close' handler is only attached on the success path, so closing
        // here cannot trigger a second reconnect loop.
        if (conn) {
            try {
                await conn.close();
            } catch {
                // already gone
            }
        }

        connection = null;
        channel = null;
        connecting = false;
        scheduleReconnect();
    }
};
