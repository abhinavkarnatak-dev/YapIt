import amqp from "amqplib";
let channel;
export const connectRabbitMQ = async () => {
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
    }
    catch (error) {
        console.log("RabbitMQ Connection Error", error);
    }
};
export const publishToQueue = async (queueName, message) => {
    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log("Message published to queue", queueName);
    }
    catch (error) {
        console.log("Error publishing message to queue", error);
    }
};
