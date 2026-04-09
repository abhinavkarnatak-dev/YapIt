import TryCatch from "../config/TryCatch.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
import axios from "axios";
import { uploadToS3 } from "../config/uploadToS3.js";
import { user_service } from "../config/Services.js";
import { io, getReceiverSocketId } from "../socket.js";
export const createNewChat = TryCatch(async (req, res) => {
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
    const receiverSocketId = getReceiverSocketId(otherUserId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat_created", { chatId: newChat._id });
    }
    const senderSocketId = getReceiverSocketId(userId?.toString() || "");
    if (senderSocketId) {
        io.to(senderSocketId).emit("chat_created", { chatId: newChat._id });
    }
    res.status(200).json({ message: "New chat created", chatId: newChat._id });
});
export const createSystemWelcomeChat = TryCatch(async (req, res) => {
    const { newUserId, systemUserId } = req.body;
    if (!newUserId || !systemUserId) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    const newChat = await Chat.create({
        users: [newUserId, systemUserId]
    });
    const savedMessage = await Messages.create({
        chatId: newChat._id,
        sender: systemUserId,
        text: "Welcome aboard! 👋 Your secure space is ready. Set up your profile and start yapping right away!",
        messageType: "text"
    });
    await Chat.findByIdAndUpdate(newChat._id, { updatedAt: Date.now() });
    // Since it's a brand new user who just signed up, they might not be connected to the socket yet.
    // However, if they are, emit the event!
    const receiverSocketId = getReceiverSocketId(newUserId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat_created", { chatId: newChat._id });
        io.to(receiverSocketId).emit("new_message", savedMessage);
    }
    res.status(200).json({ success: true });
});
export const triggerConnectionReqEvent = TryCatch(async (req, res) => {
    const { receiverId } = req.body;
    if (!receiverId) {
        res.status(400).json({ message: "Receiver ID required" });
        return;
    }
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("connection_request", { from: req.user?._id });
    }
    res.status(200).json({ success: true });
});
export const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    const chats = await Chat.find({
        users: userId
    }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== userId);
        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
            deletedBy: { $ne: userId.toString() },
            deletedForEveryone: false
        });
        const latestMsg = await Messages.findOne({
            chatId: chat._id,
            deletedBy: { $ne: userId.toString() }
        }).sort({ createdAt: -1 });
        let computedLatestMessage = null;
        if (latestMsg) {
            computedLatestMessage = {
                text: latestMsg.deletedForEveryone ? "" : (latestMsg.text || (latestMsg.messageType === "image" ? "📷 Image" : latestMsg.messageType === "document" && latestMsg.document ? `📄 ${latestMsg.document.originalName}` : "📎 Attachment")),
                sender: latestMsg.sender,
                deletedForEveryone: latestMsg.deletedForEveryone,
                createdAt: latestMsg.createdAt
            };
        }
        try {
            const { data } = await axios.get(`${user_service}/api/v1/user/${otherUserId}`);
            return {
                user: data?.user,
                chat: {
                    ...chat.toObject(),
                    latestMessage: computedLatestMessage,
                    unseenCount
                }
            };
        }
        catch (error) {
            console.log(error);
            return {
                user: { _id: otherUserId, name: "Unknown User" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: computedLatestMessage,
                    unseenCount
                }
            };
        }
    }));
    res.status(200).json({ chats: chatWithUserData });
});
export const sendMessage = TryCatch(async (req, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const attachedFile = req.file;
    if (!senderId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!chatId) {
        res.status(400).json({ message: "Chat ID is required" });
        return;
    }
    if (!text && !attachedFile) {
        res.status(400).json({ message: "Message is required" });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }
    const isUserInChat = chat.users.some((userId) => userId.toString() === senderId.toString());
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
    let documentData = undefined;
    if (attachedFile) {
        const s3Url = await uploadToS3(attachedFile, "chat-attachments");
        if (attachedFile.mimetype.startsWith("image/")) {
            imageUrl = s3Url;
        }
        else {
            documentData = {
                url: s3Url,
                originalName: attachedFile.originalname,
                size: attachedFile.size,
                format: attachedFile.originalname.split('.').pop()?.toUpperCase() || "DOC"
            };
        }
    }
    let linkPreview;
    if (text) {
        const urls = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/g);
        if (urls && urls.length > 0) {
            const firstUrl = urls[0].startsWith('http') ? urls[0] : `https://${urls[0]}`;
            const isYT = firstUrl.match(/(?:youtube\.com|youtu\.be)/i);
            const isPreviewable = firstUrl.match(/(?:twitter\.com|x\.com)/i);
            try {
                if (isYT) {
                    const res = await axios.get(`https://noembed.com/embed?url=${encodeURIComponent(firstUrl)}`);
                    if (res.data && res.data.title) {
                        linkPreview = {
                            title: res.data.title,
                            publisher: 'YouTube',
                            image: { url: res.data.thumbnail_url }
                        };
                    }
                }
                else if (isPreviewable) {
                    const res = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(firstUrl)}`);
                    if (res.data && res.data.status === 'success' && res.data.data) {
                        const payload = res.data.data;
                        linkPreview = {
                            title: payload.title,
                            description: payload.description,
                            image: payload.image ? { url: payload.image.url } : undefined,
                            logo: payload.logo ? { url: payload.logo.url } : undefined,
                            publisher: payload.publisher
                        };
                    }
                }
            }
            catch (err) {
                console.log("Error fetching link preview natively:", err);
            }
        }
    }
    const savedMessage = await Messages.create({
        chatId,
        sender: senderId,
        text,
        image: imageUrl ? { publicId: "", url: imageUrl } : undefined,
        document: documentData,
        messageType: imageUrl ? "image" : documentData ? "document" : "text",
        linkPreview,
    });
    await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });
    const receiverSocketId = getReceiverSocketId(otherUserId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", savedMessage);
    }
    res.status(201).json({ message: "Message sent successfully", savedMessage });
});
export const getMessagesByChat = TryCatch(async (req, res) => {
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
    const isUserInChat = chat.users.some((userId) => userId.toString() === userId.toString());
    if (!isUserInChat) {
        res.status(403).json({ message: "User is not part of this chat" });
        return;
    }
    const seenAtTime = new Date();
    const messageMarkedAsSeen = await Messages.updateMany({
        chatId,
        sender: { $ne: userId },
        seen: false
    }, {
        $set: { seen: true, seenAt: seenAtTime }
    });
    const messages = await Messages.find({
        chatId,
        deletedBy: { $ne: userId.toString() }
    }).sort({ createdAt: 1 });
    const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());
    if (messageMarkedAsSeen.modifiedCount > 0 && otherUserId) {
        const receiverSocketId = getReceiverSocketId(otherUserId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messages_seen", { chatId, seenAt: seenAtTime });
        }
    }
    const censoredMessages = messages.map(msg => {
        if (msg.deletedForEveryone) {
            const tempObj = msg.toObject();
            delete tempObj.text;
            delete tempObj.image;
            delete tempObj.document;
            delete tempObj.linkPreview;
            return tempObj;
        }
        return msg;
    });
    try {
        const { data } = await axios.get(`${user_service}/api/v1/user/${otherUserId}`);
        if (!otherUserId) {
            res.status(404).json({ message: "Other user not found" });
            return;
        }
        res.status(200).json({ messages: censoredMessages, user: data.user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            messages: censoredMessages,
            user: { _id: otherUserId, name: "Unknown User" }
        });
    }
});
export const deleteChat = TryCatch(async (req, res) => {
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
    await Messages.deleteMany({ chatId: chat._id });
    await Chat.deleteOne({ _id: chat._id });
    const receiverSocketId = getReceiverSocketId(otherUserId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat_deleted", { chatId: chat._id.toString() });
    }
    res.status(200).json({ message: "Chat deleted successfully" });
});
export const deleteMessage = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { messageId } = req.params;
    const { type } = req.body;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const message = await Messages.findById(messageId);
    if (!message) {
        res.status(404).json({ message: "Message not found" });
        return;
    }
    if (type === "everyone") {
        if (message.sender.toString() !== userId.toString()) {
            res.status(403).json({ message: "You can only delete your own messages for everyone" });
            return;
        }
        message.deletedForEveryone = true;
        await message.save();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());
            if (otherUserId) {
                const receiverSocketId = getReceiverSocketId(otherUserId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("message_deleted", { messageId: message._id, chatId: message.chatId });
                }
            }
        }
    }
    else if (type === "me") {
        if (!message.deletedBy.includes(userId.toString())) {
            message.deletedBy.push(userId.toString());
            await message.save();
        }
    }
    else {
        res.status(400).json({ message: "Invalid delete type" });
        return;
    }
    res.status(200).json({ message: "Message deleted successfully", deletedMessage: message });
});
export const markMessagesAsSeen = TryCatch(async (req, res) => {
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
    const seenAtTime = new Date();
    const messageMarkedAsSeen = await Messages.updateMany({
        chatId,
        sender: { $ne: userId },
        seen: false
    }, {
        $set: { seen: true, seenAt: seenAtTime }
    });
    const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());
    if (messageMarkedAsSeen.modifiedCount > 0 && otherUserId) {
        const receiverSocketId = getReceiverSocketId(otherUserId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messages_seen", { chatId, seenAt: seenAtTime });
        }
    }
    res.status(200).json({ success: true, count: messageMarkedAsSeen.modifiedCount });
});
export const downloadDocument = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { messageId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const message = await Messages.findById(messageId);
    if (!message || (!message.document && !message.image)) {
        res.status(404).json({ message: "Media not found" });
        return;
    }
    const chat = await Chat.findById(message.chatId);
    if (!chat || !chat.users.some(u => u.toString() === userId.toString())) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    const downloadUrl = (message.document && message.document.url) ? message.document.url : message.image?.url;
    const getExt = () => {
        if (!downloadUrl)
            return 'jpg';
        const cleanStr = downloadUrl.split('?')[0];
        return cleanStr.split('.').pop()?.toLowerCase() || 'jpg';
    };
    const originalName = (message.document && message.document.originalName) ? message.document.originalName : `image-${message._id}.${getExt()}`;
    if (!downloadUrl) {
        res.status(404).json({ message: "Valid media URL not found" });
        return;
    }
    try {
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }
        response.data.pipe(res);
    }
    catch (error) {
        console.error("Failed to proxy download from S3", error);
        res.status(500).json({ message: "Failed to download document" });
    }
});
export const editMessage = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { messageId } = req.params;
    const { text } = req.body;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!text || text.trim() === "") {
        res.status(400).json({ message: "Text cannot be empty" });
        return;
    }
    const message = await Messages.findById(messageId);
    if (!message) {
        res.status(404).json({ message: "Message not found" });
        return;
    }
    if (message.sender.toString() !== userId.toString()) {
        res.status(403).json({ message: "You can only edit your own messages" });
        return;
    }
    message.editHistory?.push({
        text: message.text || "",
        editedAt: new Date()
    });
    // @ts-ignore - editHistory is recognized via mongoose model schema
    message.text = text;
    message.isEdited = true;
    let linkPreview = undefined;
    const urls = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/g);
    if (urls && urls.length > 0) {
        const firstUrl = urls[0].startsWith('http') ? urls[0] : `https://${urls[0]}`;
        const isYT = firstUrl.match(/(?:youtube\.com|youtu\.be)/i);
        const isPreviewable = firstUrl.match(/(?:twitter\.com|x\.com)/i);
        try {
            if (isYT) {
                const resReq = await axios.get(`https://noembed.com/embed?url=${encodeURIComponent(firstUrl)}`);
                if (resReq.data && resReq.data.title) {
                    linkPreview = {
                        title: resReq.data.title,
                        publisher: 'YouTube',
                        image: { url: resReq.data.thumbnail_url }
                    };
                }
            }
            else if (isPreviewable) {
                const resReq = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(firstUrl)}`);
                if (resReq.data && resReq.data.status === 'success' && resReq.data.data) {
                    const payload = resReq.data.data;
                    linkPreview = {
                        title: payload.title,
                        description: payload.description,
                        image: payload.image ? { url: payload.image.url } : undefined,
                        logo: payload.logo ? { url: payload.logo.url } : undefined,
                        publisher: payload.publisher
                    };
                }
            }
        }
        catch (err) {
            console.log("Error fetching link preview natively:", err);
        }
    }
    message.linkPreview = linkPreview;
    await message.save();
    const chat = await Chat.findById(message.chatId);
    if (chat) {
        const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());
        if (otherUserId) {
            const receiverSocketId = getReceiverSocketId(otherUserId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("message_edited", {
                    messageId: message._id,
                    chatId: message.chatId,
                    text: message.text,
                    linkPreview: message.linkPreview,
                    isEdited: true
                });
            }
        }
    }
    res.status(200).json({ message: "Message edited successfully", updatedMessage: message });
});
