import { Router } from "express";
import {
    login_user,
    register_user,
    get_user_data,
    add_solved_problem,
    get_user_id,
    verify_token,
    get_liked_problems,
} from "../controllers/auth.js";

const router = Router();

router.post("/register", register_user);
router.post("/login", login_user);
router.get("/profile", verify_token, get_user_data);
router.post("/add-problem", add_solved_problem);
router.get("/", get_user_id);
router.get("/likes", verify_token, get_liked_problems);

export default router;
