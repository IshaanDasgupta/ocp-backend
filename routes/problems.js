import { Router } from "express";
import {
    list_problems,
    get_problem_by_id,
    create_problem,
    update_problem,
    delete_problem,
} from "../controllers/problems.js";

const router = Router();

router.get("/", list_problems);
router.get("/problem/:problem_id", get_problem_by_id);
router.post("/", create_problem);
router.put("/:problem_id", update_problem);
router.delete("/:problem_id", delete_problem);

export default router;
