import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
export const uploadToS3 = async (file, folder) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${folder}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    await s3.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${fileName}`;
};
