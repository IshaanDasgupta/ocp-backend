import { Router } from "express";
import {
    create_playground_submission,
    create_submission,
    get_submission,
    delete_playground_submission,
    delete_submission,
} from "../controllers/submissions.js";
import { verify_token } from "../controllers/auth.js";

const router = Router();

router.post("/playground", create_playground_submission);
router.delete("/playground", delete_playground_submission);
router.get("/", get_submission);
router.post("/", verify_token, create_submission);
router.delete("/", verify_token, delete_submission);

export default router;
