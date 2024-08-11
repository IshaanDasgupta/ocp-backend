import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { create_error } from "../utils/error.js";

export const register_user = async (req, res, next) => {
    const { password, email } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        // console.log({ username, password, name, email });
        if (existingUser) {
            return next(create_error(400, "user already exits"));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            ...req.body,
            password: hashedPassword,
        });

        const saved_user = await user.save();

        const token = jwt.sign(
            { user_id: saved_user._id },
            process.env.JWT_SECRET
        );
        res.status(201).json({
            user_id: saved_user._id,
            token: token,
        });
    } catch (err) {
        next(err);
    }
};

export const login_user = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return next(create_error(404, "user not found"));
        }

        const isPasswordValid = await bcrypt.compare(user.password, password);
        if (!isPasswordValid) {
            return next(create_error(404, "invalid username or password"));
        }

        const saved_user = await user.save();

        const token = jwt.sign(
            { user_id: saved_user._id },
            process.env.JWT_SECRET
        );
        res.status(201).json({
            user_id: saved_user._id,
            token: token,
        });
    } catch (err) {
        next(err);
    }
};

export const verify_token = (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "no token provided" });
    }

    try {
        const decoded_id = jwt.verify(token, JWT_SECRET);
        req.user_id = decoded_id;
        next();
    } catch (err) {
        return next(create_error(401, "invalid token"));
    }
};
