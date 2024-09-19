import { Router } from "express";
import {
    list_problems,
    get_problem_by_id,
    create_problem,
    update_problem,
    delete_problem,
    like_problem,
    remove_liked_problem,
} from "../controllers/problems.js";
import { verify_token } from "../controllers/auth.js";

const router = Router();

router.get("/all", verify_token, list_problems);
router.get("/", verify_token, get_problem_by_id);
router.post("/", create_problem);
router.post("/like", verify_token, like_problem);
router.post("/remove-like", verify_token, remove_liked_problem);
router.put("/", update_problem);
router.delete("/", delete_problem);

export default router;
