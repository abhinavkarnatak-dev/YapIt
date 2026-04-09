import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { User } from "../model/User.js";
import { redisClient } from "../server.js";
import { uploadToS3 } from "../config/uploadToS3.js";
import axios from "axios";
export const loginUser = TryCatch(async (req, res) => {
    const { name, email } = req.body;
    const userExists = await User.findOne({ email });
    if (req.path === '/signup' && userExists) {
        return res.status(400).json({ message: "User already exists. Please log in." });
    }
    if (req.path === '/login' && !userExists) {
        return res.status(404).json({ message: "User not found. Please sign up." });
    }
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    const otpExpiry = 60 * 5;
    await redisClient.set(otpKey, otp, { EX: otpExpiry });
    await redisClient.set(rateLimitKey, "1", { EX: 60 });
    if (name) {
        await redisClient.set(`user:${email}`, name, { EX: 60 * 5 });
    }
    const message = {
        to: email,
        otp,
    };
    await publishToQueue("send-otp", message);
    return res.status(200).json({ message: "OTP sent successfully." });
});
export const verifyUser = TryCatch(async (req, res) => {
    const { email, enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        return res.status(400).json({ message: "Please provide email and OTP." });
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp) {
        return res.status(400).json({ message: "OTP expired or invalid." });
    }
    if (storedOtp !== enteredOtp) {
        return res.status(400).json({ message: "Invalid OTP." });
    }
    const userName = await redisClient.get(`user:${email}`);
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    let isNewUser = false;
    if (!user) {
        user = await User.create({ name: userName?.toString(), email });
        isNewUser = true;
    }
    await redisClient.del(`user:${email}`);
    if (isNewUser) {
        try {
            let systemUser = await User.findOne({ email: "system@yapit.com" });
            if (!systemUser) {
                systemUser = await User.create({
                    name: "YapIt Team",
                    email: "system@yapit.com",
                    profilePic: ""
                });
            }
            axios.post(`${process.env.CHAT_SERVICE || 'http://localhost:5002'}/api/v1/chat/system-welcome`, {
                newUserId: user._id,
                systemUserId: systemUser._id
            }).catch(e => console.error("Could not trigger system welcome chat:", e.message));
        }
        catch (err) {
            console.error("Error setting up system welcome:", err);
        }
    }
    const token = generateToken({ id: user._id, email: user.email });
    return res.status(200).json({
        message: "OTP verified successfully.",
        user, token
    });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    return res.status(200).json({ user });
});
export const updateName = TryCatch(async (req, res) => {
    const { name } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.name = name;
    await user.save();
    const token = generateToken({ id: user._id, email: user.email });
    return res.status(200).json({ message: "Name updated successfully.", user, token });
});
export const updateProfilePic = TryCatch(async (req, res) => {
    const imageFile = req.file;
    let imageUrl = "";
    if (imageFile) {
        imageUrl = await uploadToS3(imageFile, "profile-images");
    }
    const user = await User.findById(req.user?._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.profilePic = imageUrl;
    await user.save();
    const token = generateToken({ id: user._id, email: user.email });
    return res.status(200).json({ message: "Profile picture updated successfully.", user, token });
});
export const getAUser = TryCatch(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    return res.status(200).json({ users });
});
