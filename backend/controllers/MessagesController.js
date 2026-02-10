import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";
import { mkdirSync, renameSync } from "fs";

export const getMessages = async (request, response, next) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    if (!user1 || !user2) {
      return response.status(400).json({ error: "Both user IDs are required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return response.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};

export const uploadFile = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).json({ error: "File is required" });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(request.file.path, {
      resource_type: "auto",
      folder: "chat-files", // Optional: Organize files in a folder
    });

    return response.status(200).json({ filePath: result.secure_url });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};

export const scheduleMessage = async (request, response, next) => {
  try {
    const sender = request.userId;
    const { recipient, messageType, content, fileUrl, scheduledAt } = request.body;

    if (!sender || !recipient || !content || !scheduledAt) {
      return response.status(400).json({ error: "All fields are required" });
    }

    const scheduleTime = new Date(scheduledAt);
    if (scheduleTime <= new Date()) {
      return response.status(400).json({ error: "Scheduled time must be in the future" });
    }

    const message = await Message.create({
      sender,
      recipient,
      messageType: messageType || "text",
      content,
      fileUrl,
      timestamp: new Date(),
      status: "scheduled",
      scheduledAt: scheduleTime,
    });

    return response.status(200).json({ message });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};
