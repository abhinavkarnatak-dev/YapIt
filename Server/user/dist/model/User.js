import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profilePic: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
});
export const User = mongoose.model("User", schema);
