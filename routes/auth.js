import { Router } from "express";
import { login_user, register_user } from "../controllers/auth.js";

const router = Router();

router.post("/register", register_user);
router.post("/login", login_user);

export default router;
