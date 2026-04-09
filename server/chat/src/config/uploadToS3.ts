import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

export const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    const fileName = `${Date.now()}-${sanitizedOriginalName}`;

    const isImage = file.mimetype.startsWith('image/');

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `${folder}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ... (!isImage && { ContentDisposition: `attachment; filename="${sanitizedOriginalName}"` })
    });

    await s3.send(command);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${fileName}`;
};