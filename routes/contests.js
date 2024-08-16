import { Router } from "express";
import {
    create_contest,
    get_all_contests,
    get_contest_by_id,
    update_contest,
    delete_contest,
} from "../controllers/contests.js";
import { verify_token } from "../controllers/auth.js";

const router = Router();

router.get("/", verify_token, get_all_contests);
router.get("/contest/", get_contest_by_id);
router.post("/", create_contest);
router.put("/", update_contest);
router.delete("/", delete_contest);

export default router;
