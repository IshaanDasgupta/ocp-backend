import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { rabbitMQ_channel } from "../index.js";
import { create_error } from "../utils/error.js";
import { Playground_Submission } from "../models/Playground_Submission.js";
import { Contest } from "../models/Contest.js";
import mongoose from "mongoose";

export const validate_contest_submission = async (submission) => {
    //checking contest is active
    const current_time = new Date(); // taking current time stamp rather than timestamp of submission as the submissions timestamp can be manipulated
    const contest = await Contest.findById(submission.contest_id);
    if (!contest) {
        return false;
    }
    const contest_start_time = new Date(contest.start_time);
    const contest_end_time = new Date(
        contest_start_time.getTime() + contest.duration * 60000
    );

    console.log(current_time, contest_start_time, contest_end_time);

    if (
        !(current_time < contest_start_time || current_time > contest_end_time)
    ) {
        console.log("contest is not active");
        return false;
    }

    //checking problem in contest
    const is_problem_in_contest = contest.problems.some((p) =>
        p.problem.equals(submission.problem_id)
    );
    console.log(is_problem_in_contest);

    if (!is_problem_in_contest) {
        console.log("problem is not in contest");
        return false;
    }

    //checking user registtered in contest
    const is_user_registered_in_contest = contest.registered_users.some((id) =>
        id.equals(submission.user_id)
    );

    if (!is_user_registered_in_contest) {
        console.log("user is not registered in contest");
        return false;
    }

    return true;
};
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
        const is_valid_contest_submission = await validate_contest_submission(
            submission
        );
        console.log(is_valid_contest_submission);
        console.log(submission.contest_id);

        if (submission.contest_id && !is_valid_contest_submission) {
            res.status(403).json({
                sucess: false,
                message:
                    "not a valid contest submission please ensure that the contest is currently active and and you are registered in it",
            });
            return;
        }
        console.log("a valied submission");

        const savedSubmission = await submission.save();
        rabbitMQ_channel.sendToQueue(
            "submission_requests",
            Buffer.from(
                JSON.stringify({
                    submission_id: savedSubmission._id,
                    type: submission.contest_id
                        ? "contest_submission"
                        : "problem_submission",
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
