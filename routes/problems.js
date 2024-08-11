import express from "express";
import { Router } from "express";
import { addProblem, listProblems,getProblemById } from "../controllers/problems.js";

const router = Router();

router.get('/',listProblems)
router.post('/add',addProblem)
router.get('/problems/:id', getProblemById);

export default router;