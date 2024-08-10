import mongoose from "mongoose";
import { TestCaseSchema } from "./Submission.js";

const ProblemSchema = new mongoose.Schema({
     title: {type: String, required: true},
     desc: {type: String , required: true},
     constraints: {type: String},
     testcases: [TestCaseSchema],
     time_limit: {type: Number},
     memory_limit: {type: Number},
     is_public: {type: Boolean},
     wrong_submissions: {type: Number},
     correct_submissions: {type: Number},
     code_stubs: [{type: String}],
     creator_id: {type: mongoose.Schema.Types.ObjectId , ref: 'User'},
     likes: {type: Number}
})

export const Problem = mongoose.model("Problem",ProblemSchema);