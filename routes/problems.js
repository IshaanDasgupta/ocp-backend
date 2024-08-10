import express from "express";
import { Router } from "express";
import { addProblem, listProblems } from "../controllers/problems.js";

const router = Router();

router.get('/',listProblems)
router.post('/add',addProblem)

export default router;