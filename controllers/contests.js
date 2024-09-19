import { redisClient } from "../index.js";
import { Contest } from "../models/Contest.js";
import { create_error } from "../utils/error.js";

export const get_all_contests = async (req, res, next) => {
    try {
        const contests = await Contest.find()
            .populate("problems.problem")
            .populate("creator_id");
        res.status(200).json(contests);
    } catch (err) {
        next(err);
    }
};

export const get_contest_by_id = async (req, res, next) => {
    try {
        const contest = await Contest.findById(req.query.contest_id)
            .populate("problems.problem")
            .populate("creator_id");

        if (!contest) {
            return next(create_error(404, "contest not found"));
        }

        res.status(200).json(contest);
    } catch (err) {
        next(err);
    }
};

export const get_leaderboard = async (req, res, next) => {
    try {
        const stringfied_leaderboard_data = await redisClient.get(
            req.query.contest_id
        );

        const leaderboard_data = await JSON.parse(stringfied_leaderboard_data);

        res.status(200).json(leaderboard_data);
    } catch (err) {
        console.log(err);
    }
};

export const create_contest = async (req, res, next) => {
    try {
        const contest = new Contest(req.body);
        await contest.save();

        res.status(201).json(contest);
    } catch (error) {
        next(error);
    }
};
export const register_user = async (req, res, next) => {
    try {
        const { contest_id } = req.body;
        const contest = await Contest.findById(contest_id);
        const { user_id } = req.user;
        if (!contest) {
            res.status(404).jon({
                message: "No such contest",
            });
        }
        if (contest.registered_users.includes(user_id)) {
            res.status(401).jon({
                message: "User has already registered",
            });
            return;
        }
        contest.registered_users.push(user_id);
        await contest.save();

        res.status(200).json({
            message: "User is succesfully registered",
        });
    } catch (err) {
        next(err);
    }
};

export const update_contest = async (req, res, next) => {
    try {
        const contest = await Contest.findByIdAndUpdate(
            req.query.contest_id,
            req.body
        )
            .populate("problems.problem")
            .populate("creator_id");

        res.status(200).json(contest);
    } catch (err) {
        next(err);
    }
};

export const delete_contest = async (req, res, next) => {
    try {
        await Contest.findByIdAndDelete(req.query.contest_id);
        res.status(200).json({
            contest_id: req.query.contest_id,
        });
    } catch (err) {
        next(err);
    }
};
