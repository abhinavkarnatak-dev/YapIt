import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { User } from "../model/User.js";
import { redisClient } from "../server.js";
export const loginUser = TryCatch(async (req, res) => {
    const { name, email } = req.body;
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
    if (!user) {
        user = await User.create({ name: userName?.toString(), email });
    }
    await redisClient.del(`user:${email}`);
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
