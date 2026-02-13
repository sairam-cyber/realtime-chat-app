import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";
import { mkdirSync, renameSync } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export const getSmartReply = async (request, response, next) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      return response.status(500).json({ error: "Gemini API Key is missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .sort({ timestamp: -1 }) // Get latest messages first
      .limit(10); // Limit to last 10 messages

    if (messages.length === 0) {
      return response.status(200).json({ reply: "Hi there!" });
    }

    // Reverse to chronological order for the AI
    const history = messages.reverse().map(msg =>
      `${msg.sender.toString() === user1 ? "Me" : "Other"}: ${msg.content || "[File]"}`
    ).join("\n");

    const prompt = `Analyze the conversation below and suggest a single, concise sentence as a reply for "Me". Keep it casual and direct.\n\nConversation:\n${history}\n\nReply:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return response.status(200).json({ reply });

  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};

export const summarizeChat = async (request, response, next) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      return response.status(500).json({ error: "Gemini API Key is missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(10);

    if (messages.length === 0) {
      return response.status(200).json({ summary: "No messages to summarize yet." });
    }

    const history = messages.reverse().map(msg =>
      `${msg.sender.toString() === user1 ? "User A" : "User B"}: ${msg.content || "[File]"}`
    ).join("\n");

    const prompt = `Summarize the following conversation in 2-3 sentences. Focus on the main topic and key points.\n\nConversation:\n${history}\n\nSummary:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return response.status(200).json({ summary });

  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};

export const markMessagesAsRead = async (request, response, next) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    if (!user1 || !user2) {
      return response.status(400).json({ error: "Both user IDs are required" });
    }

    // Update messages where recipient is user1 and sender is user2
    await Message.updateMany(
      { sender: user2, recipient: user1, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );

    return response.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error.message });
  }
};
