import { Router } from "express";
import {
    create_playground_submission,
    create_submission,
    get_submission,
    submission_status,
    delete_playground_submission,
    delete_submission
} from "../controllers/submissions.js";

const router = Router();

router.get("/", get_submission);
router.get("/check", submission_status);
router.post("/", create_submission);
router.post("/playground", create_playground_submission);
router.delete("/playground",delete_playground_submission);
router.delete("/", delete_submission);

export default router;
