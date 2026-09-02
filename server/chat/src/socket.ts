import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://client:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const userSocketMap: Record<string, Set<string>> = {};

const roomForUser = (userId: string) => `user:${userId}`;

export const getUserRoom = (userId: string) => {
  const sockets = userSocketMap[userId];
  return sockets && sockets.size > 0 ? roomForUser(userId) : undefined;
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId as string;

  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
    socket.join(roomForUser(userId));
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverRoom = getUserRoom(receiverId);
    if (receiverRoom) {
      io.to(receiverRoom).emit("typing", { senderId });
    }
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    const receiverRoom = getUserRoom(receiverId);
    if (receiverRoom) {
      io.to(receiverRoom).emit("stop_typing", { senderId });
    }
  });

  socket.on("profile_updated", ({ userId, name, profilePic }) => {
    io.emit("user_profile_updated", { userId, name, profilePic });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId && userId !== "undefined") {
      const sockets = userSocketMap[userId];
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          delete userSocketMap[userId];
        }
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
