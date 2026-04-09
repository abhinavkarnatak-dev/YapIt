import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    chatId: Types.ObjectId;
    sender: string;
    text?: string;
    image?: { publicId: string; url: string };
    document?: { url: string; originalName: string; size: number; format: string };
    messageType: "text" | "image" | "document";
    seen: boolean;
    seenAt?: Date;
    deletedBy: string[];
    deletedForEveryone: boolean;
    linkPreview?: {
        title?: string;
        description?: string;
        image?: { url: string };
        logo?: { url: string };
        publisher?: string;
    };
    isEdited?: boolean;
    editHistory?: { text: string; editedAt: Date }[];
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
    document: {
        url: String,
        originalName: String,
        size: Number,
        format: String
    },
    messageType: {
        type: String,
        enum: ["text", "image", "document"],
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
    },
    linkPreview: {
        title: String,
        description: String,
        image: { url: String },
        logo: { url: String },
        publisher: String
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        text: String,
        editedAt: Date
    }]
}, { timestamps: true });

export const Messages = mongoose.model<IMessage>("Message", schema);