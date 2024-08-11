import { Router } from "express";
import {
    list_problems,
    get_problem_by_id,
    create_problem,
    update_problem,
    delete_problem,
} from "../controllers/problems.js";

const router = Router();

router.get("/all", list_problems);
router.get("/", get_problem_by_id);
router.post("/", create_problem);
router.put("/", update_problem);
router.delete("/", delete_problem);

export default router;
