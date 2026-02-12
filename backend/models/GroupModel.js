import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Messages",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

groupSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

groupSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Group = mongoose.model("Groups", groupSchema);

export default Group;
