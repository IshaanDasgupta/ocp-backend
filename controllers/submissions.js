import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { rabbitMQ_channel } from "../index.js";

export const get_submission = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.query.sumbission_id);

        if (submission.status === "pending") {
            return res.status(200).json({ status: submission.status });
        }
        res.status(200).json(submission);
    } catch (error) {
        next(error);
    }
};

export const submission_status = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.query.sumbission_id);
        res.status(201).json({
            status: submission.status,
        });
    } catch (error) {
        next(error);
    }
};

export const create_submission = async (req, res, next) => {
    try {
        let { problem_id, type } = req.body;

        const initial_configurations = {
            time_taken: null,
            memory_taken: null,
            result: null,
            status: "pending",
            total_score: null,
        };

        if (type === "submit") {
            const problem = await Problem.findById(problem_id);

            const test_cases = [];
            problem.testcases.forEach((testcase) => {
                test_cases.push({
                    test_case: {
                        input: testcase.input,
                        expected_output: testcase.expected_output,
                        is_hidden: testcase.is_hidden,
                        score: testcase.score,
                    },
                });
            });

            initial_configurations.test_cases = test_cases;
        }

        const submission = new Submission({
            ...req.body,
            ...initial_configurations,
        });

        const savedSubmission = await submission.save();

        var queue = "submission_requests";
        rabbitMQ_channel.sendToQueue(
            queue,
            Buffer.from(
                JSON.stringify({
                    submission_id: savedSubmission._id,
                    language: savedSubmission.language,
                })
            )
        );

        res.status(201).json(savedSubmission);
    } catch (error) {
        next(error);
    }
};
