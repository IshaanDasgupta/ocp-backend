import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { rabbitMQ_channel } from "../index.js";
import { create_error } from "../utils/error.js";
import { Playground_Submission } from "../models/Playground_Submission.js";

export const get_submission = async (req, res, next) => {
    try {
        if (!req.query.sumbission_id) {
            return next(create_error(500, "specify the sumbission_id"));
        }

        if (!req.query.type) {
            return next(create_error(500, "specify the submission type"));
        }

        if (req.query.type === "playground_submission") {
            const submission = await Playground_Submission.findById(
                req.query.sumbission_id
            );

            if (!submission) {
                return next(create_error(404, "invalid submission id "));
            }

            if (submission.status === "pending") {
                return res.status(200).json({ status: submission.status });
            }
            res.status(200).json(submission);
            return;
        }

        if (req.query.type === "problem_submission") {
            const submission = await Submission.findById(
                req.query.sumbission_id
            );

            if (!submission) {
                return next(create_error(404, "invalid submission id "));
            }

            if (submission.status === "pending") {
                return res.status(200).json({ status: submission.status });
            }
            res.status(200).json(submission);
            return;
        }

        return next(
            create_error(500, `submission type ${req.query.type} not supported`)
        );
    } catch (error) {
        next(error);
    }
};

export const submission_status = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.query.sumbission_id);

        if (!submission) {
            return next(create_error(404, "invalid submission id "));
        }

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
                    type: "problem_submission",
                })
            )
        );

        res.status(201).json(savedSubmission);
    } catch (error) {
        next(error);
    }
};

export const create_playground_submission = async (req, res, next) => {
    try {
        const initial_configurations = {
            time_taken: null,
            memory_taken: null,
            status: "pending",
            output: null,
        };

        const playground_submission = new Playground_Submission({
            ...req.body,
            ...initial_configurations,
        });

        const savedSubmission = await playground_submission.save();

        var queue = "submission_requests";
        rabbitMQ_channel.sendToQueue(
            queue,
            Buffer.from(
                JSON.stringify({
                    submission_id: savedSubmission._id,
                    type: "playground_submission",
                })
            )
        );

        res.status(201).json(savedSubmission);
    } catch (error) {
        next(error);
    }
};
