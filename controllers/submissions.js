import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";

export const get_submission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.sumbission_id);

        if (submission.status === "pending") {
            return res.status(200).json({ status: submission.status });
        }
        res.status(200).json(submission);
    } catch (error) {
        next(error);
    }
};

export const submission_status = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.sumbission_id);
        res.status(201).json({
            status: submission.status,
        });
    } catch (error) {
        next(error);
    }
};

export const create_submission = async (req, res) => {
    try {
        let { problem_id, type } = req.body;

        if (type === "submit") {
            const problem = await Problem.findById(problem_id);
            test_cases = problem.testcases;
        }

        const submission = new Submission({
            ...req.body,
            time_taken: null,
            memory_taken: null,
            result: null,
            status: "pending",
            total_score: null,
        });

        const savedSubmission = await submission.save();
        res.status(201).json(savedSubmission);
    } catch (error) {
        next(error);
    }
};
