import amqp from "amqplib"

let channel: amqp.Channel

export const connectRabbitMQ = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            const connection = await amqp.connect({
                protocol: "amqp",
                hostname: process.env.RABBITMQ_HOST,
                port: 5672,
                username: process.env.RABBITMQ_USERNAME,
                password: process.env.RABBITMQ_PASSWORD,
            });
            channel = await connection.createChannel();
            console.log("Connected to RabbitMQ");
            return;
        } catch (error) {
            console.log(`RabbitMQ Connection Error. Retries left: ${retries - 1}`, (error as any).message || error);
            retries -= 1;
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.log("Failed to connect to RabbitMQ after retries.");
}

export const publishToQueue = async (queueName: string, message: any) => {
    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log("Message published to queue", queueName);
    } catch (error) {
        console.log("Error publishing message to queue", error);
    }
}