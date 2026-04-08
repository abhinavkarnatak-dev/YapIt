import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    }
}, {
    timestamps: true,
});
schema.index({ sender: 1, receiver: 1 }, { unique: false });
export const ConnectionRequest = mongoose.model("ConnectionRequest", schema);
