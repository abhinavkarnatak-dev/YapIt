import mongoose, { Schema } from "mongoose";
const schema = new Schema({
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
export const Messages = mongoose.model("Message", schema);
