import mongoose from "mongoose";
import { Problem } from "./Problem";
import { User } from "./User";

const ContestSchema = new mongoose.Schema({
        title: {type: String, required: true},
        start_time: {type: Date},
        duration: {type: Number}, // minutes
        problems: [{
            problem: Problem,
            score: {type: Number}
        }],
        creator_id: [User]    
});

export const Contest = mongoose.model("Contest",ContestSchema);