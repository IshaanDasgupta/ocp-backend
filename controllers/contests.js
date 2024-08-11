import {Contest} from '../models/Contest.js';

export const createContest = async (req, res) => {
    try {
        const { title, start_time, duration, problems } = req.body;

        const contest = new Contest({
            title,
            start_time,
            duration,
            problems,
        });

        await contest.save();
        res.status(201).json(contest);
    } catch (error) {
        console.error('Error creating contest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find().populate('problems.problem').populate('creator_id');
        res.status(200).json(contests);
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
