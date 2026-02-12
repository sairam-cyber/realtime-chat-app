import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile, scheduleMessage, getSmartReply, summarizeChat, markMessagesAsRead } from "../controllers/MessagesController.js";

import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files/" });

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);
messagesRoutes.post("/schedule-message", verifyToken, scheduleMessage);
messagesRoutes.post("/smart-reply", verifyToken, getSmartReply);
messagesRoutes.post("/summarize-chat", verifyToken, summarizeChat);
messagesRoutes.post("/mark-read", verifyToken, markMessagesAsRead);

export default messagesRoutes;
