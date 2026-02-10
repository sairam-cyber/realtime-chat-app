import cron from "node-cron";
import Message from "../models/MessageModel.js";

const setupCronJobs = () => {
    cron.schedule("* * * * *", async () => {
        // console.log("Running scheduled message job...");
        try {
            const now = new Date();
            const messages = await Message.find({
                status: "scheduled",
                scheduledAt: { $lte: now },
            })
                .populate("sender", "id email firstName lastName image color")
                .populate("recipient", "id email firstName lastName image color");

            for (const message of messages) {
                message.status = "sent";
                await message.save();

                if (global.io) {
                    const recipientSocketId = global.userSocketMap.get(
                        message.recipient._id.toString()
                    );
                    const senderSocketId = global.userSocketMap.get(
                        message.sender._id.toString()
                    );

                    if (recipientSocketId) {
                        global.io.to(recipientSocketId).emit("receiveMessage", message);
                    }
                    if (senderSocketId) {
                        global.io.to(senderSocketId).emit("receiveMessage", message);
                    }
                }
            }
        } catch (error) {
            console.error("Error processing scheduled messages:", error);
        }
    });
};

export default setupCronJobs;
