import { Router } from "express";
import {
    create_contest,
    get_all_contests,
    get_contest_by_id,
    update_contest,
    delete_contest,
    register_user,
    get_leaderboard,
} from "../controllers/contests.js";
import { verify_token } from "../controllers/auth.js";

const router = Router();

router.get("/all", verify_token, get_all_contests);
router.get("/", verify_token, get_contest_by_id);
router.get("/leaderboard", verify_token, get_leaderboard);
router.post("/", verify_token, create_contest);
router.put("/", verify_token, update_contest);
router.delete("/", verify_token, delete_contest);
router.post("/register", verify_token, register_user);

export default router;
