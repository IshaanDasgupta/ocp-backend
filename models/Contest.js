import mongoose from "mongoose";

const contest_schema = new mongoose.Schema({
    title: { type: String, required: true },
    start_time: { type: Date },
    duration: { type: Number }, // minutes
    problems: [
        {
            problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
            score: { type: Number },
        },
    ],
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Contest = mongoose.model("Contest", contest_schema);
