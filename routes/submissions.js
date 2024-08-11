import { Router } from "express";
import {
    create_submission,
    get_submission,
    submission_status,
} from "../controllers/submissions.js";

const router = Router();

router.get("/:sumbission_id", get_submission);
router.get("/check", submission_status);
router.post("/", create_submission);

export default router;
