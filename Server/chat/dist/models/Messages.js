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
export const Messages = mongoose.model("Message", schema);
