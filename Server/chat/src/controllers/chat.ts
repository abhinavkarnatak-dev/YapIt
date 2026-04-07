import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
import axios from "axios";
import { uploadToS3 } from "../config/uploadToS3.js";
import { user_service } from "../config/Services.js";

export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
        res.status(400).json({ message: "Other User ID is required" });
        return;
    }

    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    });

    if (existingChat) {
        res.status(200).json({ message: "Chat already exists", chatId: existingChat._id });
        return;
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId]
    });

    res.status(200).json({ message: "New chat created", chatId: newChat._id });
})

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    const chats = await Chat.find({
        users: userId
    }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {
            const otherUserId = chat.users.find((id) => id !== userId);
            const unseenCount = await Messages.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId },
                seen: false,
            });

            try {
                const { data } = await axios.get(`${user_service}/api/v1/user/${otherUserId}`);

                return {
                    user: data?.user,
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount
                    }
                }
            } catch (error) {
                console.log(error);
                return {
                    user: { _id: otherUserId, name: "Unknown User" },
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount
                    }
                }
            }
        })
    )
    res.status(200).json({ chats: chatWithUserData });
})

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file

    if (!senderId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!chatId) {
        res.status(400).json({ message: "Chat ID is required" });
        return;
    }

    if (!text && !imageFile) {
        res.status(400).json({ message: "Message is required" });
        return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }

    const isUserInChat = chat.users.some((userId) => userId.toString() === senderId.toString())

    if (!isUserInChat) {
        res.status(403).json({ message: "User is not part of this chat" });
        return;
    }

    const otherUserId = chat.users.find((userId) => userId.toString() !== senderId.toString());

    if (!otherUserId) {
        res.status(401).json({ message: "No other user found" });
        return;
    }

    let imageUrl = "";
    if (imageFile) {
        imageUrl = await uploadToS3(imageFile, "chat-images");
    }

    const savedMessage = await Messages.create({
        chatId,
        sender: senderId,
        text,
        image: imageFile ? { publicId: "", url: imageUrl } : undefined,
        messageType: imageFile ? "image" : "text",
    });

    chat.latestMessage = {
        text: text || "📷 Image",
        sender: senderId,
    };
    await chat.save();

    res.status(201).json({ message: "Message sent successfully", savedMessage });
})

export const getMessagesByChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!chatId) {
        res.status(400).json({ message: "Chat ID is required" });
        return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }

    const isUserInChat = chat.users.some((userId) => userId.toString() === userId.toString())

    if (!isUserInChat) {
        res.status(403).json({ message: "User is not part of this chat" });
        return;
    }

    const messageMarkedAsSeen = await Messages.updateMany(
        {
            chatId,
            sender: { $ne: userId },
            seen: false
        },
        {
            $set: { seen: true, seenAt: new Date() }
        }
    );

    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());

    try {
        const { data } = await axios.get(`${user_service}/api/v1/user/${otherUserId}`);

        if (!otherUserId) {
            res.status(404).json({ message: "Other user not found" });
            return;
        }

        res.status(200).json({ messages, user: data.user });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            messages,
            user: { _id: otherUserId, name: "Unknown User" }
        });
    }
})

export const deleteChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.params;

    if (!userId || !otherUserId) {
        res.status(400).json({ message: "User IDs are required" });
        return;
    }

    const chat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    });

    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }

    // Delete all messages referencing the chat
    await Messages.deleteMany({ chatId: chat._id });
    
    // Delete the chat itself
    await chat.deleteOne();

    res.status(200).json({ message: "Chat deleted successfully" });
});