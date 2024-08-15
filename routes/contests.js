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

router.get("/",verify_token,get_all_contests);
router.get("/contest/:contest_id", get_contest_by_id);
router.post("/", create_contest);
router.put("/:contest_id", update_contest);
router.delete("/:contest_id", delete_contest);

export default router;
