import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    chatId: Types.ObjectId;
    sender: string;
    text?: string;
    image?: { publicId: string; url: string };
    messageType: "text" | "image";
    seen: boolean;
    seenAt?: Date;
    deletedBy: string[];
    deletedForEveryone: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<IMessage>({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
    },
    image: {
        publicId: String,
        url: String
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text",
    },
    seen: {
        type: Boolean,
        default: false
    },
    seenAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: [String],
        default: []
    },
    deletedForEveryone: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Messages = mongoose.model<IMessage>("Message", schema);