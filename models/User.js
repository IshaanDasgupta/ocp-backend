import mongoose from "mongoose";
import { Submission} from "./Submission.js";
import { Problem } from "./Problem.js";


const UserSchema = new mongoose.Schema({
    username: {type: String , required: true, unique: true},
    name: {type: String,required: true}, //handle format at frontend
    email: {type: String,required: true, unique: true},
    password: {type: String , required : true },
    submissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Submission'}],
    problems : [{type: mongoose.Schema.Types.ObjectId, ref: 'Problem'}],
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Problem'}]
})

export const User = mongoose.model("User",UserSchema);