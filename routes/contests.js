import express from 'express';
import { createContest, getAllContests } from '../controllers/contests.js';

const router = express.Router();

router.post('/add', createContest);

router.get('/', getAllContests);

export default router;
