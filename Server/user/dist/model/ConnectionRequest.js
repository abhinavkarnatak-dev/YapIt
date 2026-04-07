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
// Prevent duplicate pending requests
// But we want to allow re-requesting if rejected, so we just use compound unique constraint? No, mongoose unique index doesn't filter perfectly with 'pending', better to control natively in controller.
schema.index({ sender: 1, receiver: 1 }, { unique: false });
export const ConnectionRequest = mongoose.model("ConnectionRequest", schema);
