import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { rabbitMQ_channel } from "../index.js";
import { create_error } from "../utils/error.js";
import { Playground_Submission } from "../models/Playground_Submission.js";

export const get_submission = async (req, res, next) => {
    try {
        if (!req.query.submission_id) {
            return next(create_error(500, "specify the submission_id"));
        }

        if (!req.query.type) {
            return next(create_error(500, "specify the submission type"));
        }

        if (req.query.type === "playground_submission") {
            const submission = await Playground_Submission.findById(
                req.query.submission_id
            );

            if (!submission) {
                return next(create_error(404, "invalid submission id "));
            }

            if (submission.status === "pending") {
                return res
                    .status(200)
                    .json({ sucess: true, status: submission.status });
            }
            res.status(200).json(submission);
            return;
        }

        if (req.query.type === "problem_submission") {
            const submission = await Submission.findById(
                req.query.submission_id
            );

            if (!submission) {
                return next(create_error(404, "invalid submission id "));
            }

            if (submission.status === "pending") {
                return res
                    .status(200)
                    .json({ sucess: true, status: submission.status });
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

export const create_submission = async (req, res, next) => {
    try {
        const { problem_id, type } = req.body;

        const initial_configurations = {
            user_id: req.user.user_id,
            time_taken: null,
            memory_taken: null,
            result: null,
            status: "pending",
            total_score: null,
        };

        if (type === "submit") {
            const problem = await Problem.findById(problem_id);

            if (!problem) {
                next(create_error(404, "problem not found"));
            }

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
        } else {
            initial_configurations.throwaway = true;
        }

        const submission = new Submission({
            ...req.body,
            ...initial_configurations,
        });

        const savedSubmission = await submission.save();

        rabbitMQ_channel.sendToQueue(
            "submission_requests",
            Buffer.from(
                JSON.stringify({
                    submission_id: savedSubmission._id,
                    type: "problem_submission",
                })
            )
        );

        res.status(201).json({
            sucess: true,
            message: "submission created",
            submission_id: submission._id,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const create_playground_submission = async (req, res, next) => {
    try {
        let initial_configurations = {
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

        rabbitMQ_channel.sendToQueue(
            "submission_requests",
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

export const delete_playground_submission = async (req, res, next) => {
    try {
        const { submission_id } = req.query;
        const deleted_submission =
            await Playground_Submission.findByIdAndDelete(submission_id);

        if (!deleted_submission) {
            next(create_error(404, "submission not found"));
        }

        res.status(200).json({
            message: "successfully deleted submission",
        });
    } catch (error) {
        next(error);
    }
};

export const delete_submission = async (req, res, next) => {
    try {
        const { submission_id } = req.query;
        console.log(submission_id);

        const submission = await Submission.findById(submission_id);
        if (!submission) {
            next(create_error(404, "submission not found"));
        }

        console.log(submission.user_id, req.user.user_id);

        if (req.user.user_id != submission.user_id) {
            next(
                create_error(
                    404,
                    "not authorized to delete this submission. you must be the owner of the submission inorder to delete it"
                )
            );
        }

        if (submission.type == "submit") {
            next(
                create_error(
                    400,
                    "submissions with type 'submit' cannot be deleted"
                )
            );
        }

        await Submission.findByIdAndDelete(submission_id);

        res.status(200).json({
            message: "successfully deleted submission",
        });
    } catch (error) {
        next(error);
    }
};
