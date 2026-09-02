import amqp from "amqplib";

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

const RECONNECT_DELAY = 5000;

let connection: AmqpConnection | null = null;
let channel: amqp.Channel | null = null;
let connecting = false;

const scheduleReconnect = () => {
    setTimeout(() => {
        connectRabbitMQ();
    }, RECONNECT_DELAY);
};

export const connectRabbitMQ = async (): Promise<void> => {
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

        ch.on("error", (err) => {
            console.log("RabbitMQ channel error:", err.message);
        });

        ch.on("close", () => {
            channel = null;
        });

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

export const publishToQueue = async (queueName: string, message: any): Promise<boolean> => {
    if (!channel) {
        console.log(`Cannot publish to ${queueName}: no RabbitMQ channel`);
        connectRabbitMQ();
        return false;
    }

    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log("Message published to queue", queueName);
        return true;
    } catch (error) {
        console.log("Error publishing message to queue", error);
        return false;
    }
};
