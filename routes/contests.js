import { Router } from "express";
import {
    create_contest,
    get_all_contests,
    get_contest_by_id,
    update_contest,
    delete_contest,
    register_user,
} from "../controllers/contests.js";
import { verify_token } from "../controllers/auth.js";

const router = Router();

router.get("/all", verify_token, get_all_contests);
router.get("/", get_contest_by_id);
router.post("/", create_contest);
router.put("/", update_contest);
router.delete("/", delete_contest);
router.post("/register",verify_token,register_user);

export default router;
