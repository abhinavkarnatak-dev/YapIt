import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";
import { ConnectionRequest } from "../model/ConnectionRequest.js";
import { publishToQueue } from "../config/rabbitmq.js";
import axios from "axios";
import { chat_service } from "../config/Services.js";

export const getUserByEmail = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user?._id.toString()) {
        return res.status(400).json({ message: "You cannot search for yourself" });
    }

    return res.status(200).json({ user });
});

export const sendConnectionRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { email } = req.body;
    const senderId = req.user?._id;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const receiver = await User.findOne({ email });
    if (!receiver) {
        return res.status(404).json({ message: "User not found" });
    }

    if (receiver._id.toString() === senderId?.toString()) {
        return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const anyExistingRequest = await ConnectionRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiver._id },
            { sender: receiver._id, receiver: senderId }
        ],
        status: { $in: ['pending', 'accepted'] }
    });

    if (anyExistingRequest) {
        if (anyExistingRequest.status === 'accepted') {
            return res.status(400).json({ message: "You are already connected with this user" });
        }
        
        if (anyExistingRequest.sender.toString() === senderId?.toString()) {
            return res.status(400).json({ message: "A connection request is already pending" });
        } else {
            return res.status(400).json({ message: "This user has already sent you a request. Check your incoming requests." });
        }
    }

    const rejectedRequest = await ConnectionRequest.findOne({
        sender: senderId,
        receiver: receiver._id,
        status: 'rejected'
    });

    if (rejectedRequest) {
        rejectedRequest.status = 'pending';
        await rejectedRequest.save();
        console.log("Updated rejected request to pending for:", rejectedRequest);
    } else {
        const nr = await ConnectionRequest.create({
            sender: senderId,
            receiver: receiver._id,
        });
        console.log("Created new connection request:", nr);
    }

    const message = {
        to: email,
        senderName: req.user?.name,
    };
    await publishToQueue("send-connection-req", message);

    try {
        await axios.post(`${process.env.CHAT_SERVICE || 'http://localhost:5002'}/api/v1/chat/trigger-req`, { receiverId: receiver._id }, {
            headers: { Authorization: req.headers.authorization }
        });
    } catch (err) {
        console.error("Error triggering socket event for connection request", err);
    }

    return res.status(200).json({ message: "Connection request sent successfully." });
});

export const getIncomingRequests = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    console.log("getIncomingRequests called for user:", userId);

    const requests = await ConnectionRequest.find({
        receiver: userId,
        status: 'pending'
    }).populate("sender", "name email profilePic").sort({ createdAt: -1 });

    console.log("getIncomingRequests found requests:", requests);
    return res.status(200).json({ requests });
});

export const acceptConnectionRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { requestId } = req.body;
    const userId = req.user?._id;
    const token = req.headers.authorization;

    if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId?.toString()) {
        return res.status(403).json({ message: "Unauthorized to accept this request" });
    }

    if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = 'accepted';
    await request.save();

    try {
        await axios.post(`${chat_service}/api/v1/chat/new`, {
            userId: userId,
            otherUserId: request.sender
        }, {
            headers: {
                Authorization: token
            }
        });
    } catch (error) {
        console.error("Error creating chat upon request acceptance", error);
    }

    try {
        const senderData = await User.findById(request.sender);
        if (senderData && req.user) {
            const message = {
                to: senderData.email,
                acceptedByName: req.user.name,
            };
            await publishToQueue("send-connection-accepted", message);
        }
    } catch (error) {
        console.error("Error sending acceptance email", error);
    }

    return res.status(200).json({ message: "Request accepted successfully." });
});

export const rejectConnectionRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { requestId } = req.body;
    const userId = req.user?._id;

    if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId?.toString()) {
        return res.status(403).json({ message: "Unauthorized to reject this request" });
    }

    if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = 'rejected';
    await request.save();

    return res.status(200).json({ message: "Request rejected successfully." });
});

export const unfriendUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { otherUserId } = req.body;
    const userId = req.user?._id;
    const token = req.headers.authorization;

    if (!otherUserId) {
        return res.status(400).json({ message: "Other User ID is required" });
    }

    const existingRequest = await ConnectionRequest.findOne({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
        ]
    });

    if (existingRequest) {
        await existingRequest.deleteOne();
    }

    try {
        await axios.delete(`${process.env.CHAT_SERVICE || 'http://localhost:5002'}/api/v1/chat/remove/${otherUserId}`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error("Error deleting chat in Chat service upon unfriending", error);
    }

    return res.status(200).json({ message: "User unfriended successfully." });
});
