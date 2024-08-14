import { Router } from "express";
import { login_user, register_user, get_user_data, add_solved_problem } from "../controllers/auth.js";

const router = Router();

router.post("/register", register_user);
router.post("/login", login_user);
router.get('/profile',get_user_data);
router.post('/add-problem',add_solved_problem);

export default router;
