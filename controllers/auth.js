import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { create_error } from "../utils/error.js";


export const get_user_data = async(req,res,next)=>{
    try{
        if (!req.query.user_id) {
            return next(create_error(500, "specify the user id"));
        }
        const user_id = req.query.user_id;
        const user = await User.findById(user_id).populate('solved_problems','title difficulty').populate("submissions",'problem_id');
        const problem_count = {
            Easy: 0,
            Medium: 0,
            Hard: 0,
        };
        user.solved_problems.forEach(problem => {
            const difficulty = problem.difficulty;
            if (difficulty) {
                problem_count[difficulty]++;
              }
          })
        res.status(200).json({
            user,
            metrics: {
                problem_count
            }
        });
    }
    catch(err){
        res.status(500).json({
            message: err.message,
            stack: err.stack
        })
    }
}


export const add_solved_problem =async(req,res,next)=>{
    try{
        const {user_id , problem_id} = req.body;
        const user = await User.findById(user_id);
        console.log(user);
        console.log(user.solved_problems.includes(problem_id));
        if(!user.solved_problems.includes(problem_id)){
            user.solved_problems.push(problem_id);
            await User.findByIdAndUpdate(user_id,user);
        }
        res.status(200).json(user);
    }
    catch(err){
        res.status(500).json({
            message: err.message,
            stack: err.stack
        })
    }
}

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

        const isPasswordValid = await bcrypt.compare(password,user.password);
        console.log(isPasswordValid)
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
        const decoded_id = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return next(create_error(401, "invalid token"));
    }
};

export const get_user_id = async(req,res,next)=>{
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: "no token provided" });
    }
    try {
        const decoded_id = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded_id);
        const user = await User.findById(decoded_id.user_id);
        console.log(user);
        if(!user){
            res.status(404).json({message: "no such user"});
        }
        return res.status(200).json({
            user_id: user._id
        })
    } catch (err) {
        return next(create_error(401, err.message));
    }
}
