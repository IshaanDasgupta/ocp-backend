import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { create_error } from "../utils/error.js";

export const list_problems = async (req, res, next) => {
    try {
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

export const like_problem = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const problem_id = req.body.problem_id;

        const user = await User.findById(user_id);

        if (user.likes.includes(problem_id)) {
            return next(
                create_error(400, "user already has liked this problem")
            );
        }

        user.likes.push(problem_id);
        await user.save();

        await Problem.findOneAndUpdate(
            { _id: problem_id },
            { $inc: { likes: 1 } }
        );

        return res
            .status(200)
            .json({ message: `sucessfully liked ${problem_id}` });
    } catch (err) {
        next(err);
    }
};

export const remove_liked_problem = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const problem_id = req.body.problem_id;

        const user = await User.findById(user_id);

        if (!user.likes.includes(problem_id)) {
            return next(create_error(400, "user has not liked this problem"));
        }

        user.likes = user.likes.filter(
            (liked_problem_id) => liked_problem_id != problem_id
        );

        await user.save();

        await Problem.findOneAndUpdate(
            { _id: problem_id },
            { $inc: { likes: -1 } }
        );

        return res
            .status(200)
            .json({ message: `sucessfully removed ${problem_id} from likes` });
    } catch (err) {
        next(err);
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
