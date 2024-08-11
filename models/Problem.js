import mongoose from "mongoose";

const problem_schema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    constraints: { type: String },
    testcases: [
        {
            input: { type: String, required: true },
            expected_output: { type: String, required: true },
            is_hidden: { type: Boolean },
            score: { type: Number },
        },
    ],
    time_limit: { type: Number },
    memory_limit: { type: Number },
    is_public: { type: Boolean },
    wrong_submissions: { type: Number },
    correct_submissions: { type: Number },
    code_stubs: [{ type: String }],
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number },
});

export const Problem = mongoose.model("Problem", problem_schema);
