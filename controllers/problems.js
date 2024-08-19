import { Problem } from "../models/Problem.js";
import { create_error } from "../utils/error.js";

export const list_problems = async (req, res, next) => {
    try {
        console.log("here");
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        next(error);
    }
};

export const get_problem_by_id = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.query.problem_id);

        if (!problem) {
            return next(create_error(404, "problem not found"));
        }

        res.status(200).json(problem);
    } catch (error) {
        next(error);
    }
};

export const create_problem = async (req, res, next) => {
    try {
        const newProblem = new Problem({
            ...req.body,
            wrong_submissions: 0,
            correct_submissions: 0,
            likes: 0,
        });

        const savedProblem = await newProblem.save();
        return res.status(201).json({
            message: "problem created",
            problem: savedProblem,
        });
    } catch (error) {
        next(error);
    }
};

export const update_problem = async (req, res, next) => {
    try {
        const contest = await Problem.findByIdAndUpdate(
            req.query.problem_id,
            req.body
        ).populate("creator_id");

        res.status(200).json(contest);
    } catch (err) {
        next(err);
    }
};

export const delete_problem = async (req, res, next) => {
    try {
        await Problem.findByIdAndDelete(req.query.problem_id);
        res.status(200).json({
            problem_id: req.query.problem_id,
        });
    } catch (err) {
        next(err);
    }
};
