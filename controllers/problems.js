import { Problem } from "../models/Problem.js";

export const addProblem = async (req, res) => {
    try {
        const {
            title,
            desc,
            constraints,
            testcases,
            time_limit,
            memory_limit,
            is_public,
            code_stubs,
            creator_id
        } = req.body;

        const wrong_submissions = 0;
        const correct_submissions = 0;
        const likes = 0;
        const newProblem = new Problem({
            title,
            desc,
            constraints,
            testcases,
            time_limit,
            memory_limit,
            is_public,
            wrong_submissions,
            correct_submissions,
            code_stubs,
            creator_id,
            likes
        });
        const savedProblem = await newProblem.save();
        return res.status(201).json({
            success: true,
            message: "Problem added successfully",
            problem: savedProblem
        });

    } catch (error) {
        console.error("Error adding problem:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add problem",
            error: error.message
        });
    }
};

export const listProblems = async (req, res) => {
        try {
            const problems = await Problem.find();
            res.status(200).json(problems);
        } catch (error) {
            console.error("Error fetching problems:", error);
            res.status(500).json({ message: "Failed to fetch problems" });
        }
    };

