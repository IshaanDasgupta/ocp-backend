import express from "express";
import { Router } from "express";
import { addSubmission, check } from "../controllers/submissions.js";

const router = Router();

router.get('/')
router.post('/add',addSubmission)
router.post('/check',check);

export default router;