import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";


export const addSubmission = async(req,res)=>{
        try {
            let { problem_id, user_id, submission_timestamp, code, language,test_cases,type} = req.body;
            let time_taken = 0, memory_taken = 0,result = null, status = "pending" , total_score = 0;

            if (!problem_id || !user_id || !submission_timestamp || !code || !language || !status || !type) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            if(type === "submit"){
                const problem = await (Problem.findById(problem_id));
                test_cases = problem.testcases;
            }

            const newSubmission = new Submission({
                problem_id,
                user_id,
                submission_timestamp,
                code,
                language,
                time_taken,
                memory_taken,
                result,
                status,
                type,
                total_score,
                test_cases
            });
            const savedSubmission = await newSubmission.save();
            res.status(201).json(savedSubmission);
            
        } catch (error) {
            console.error("Error adding submission:", error);
            res.status(500).json({ message: "Failed to add submission" });
        }
}

export const check = async(req,res)=>{
    const {submission_id} = req.body;
    const submission = await Submission.findById(submission_id);

    if(submission.status === "submitted"){
        res.status(201).json({
            result: submission.result,
            test_cases: submission.test_cases,
            status: submission.status
        })
    }
    res.status(201).json({
        status: submission.status
    })
}