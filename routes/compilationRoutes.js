import express from 'express';
import { cppCompilation,javaCompilation,pythonCompilation } from '../controllers/compilationController.js';
import { executeCppCode } from '../controllers/cppController.js';

const router = express.Router();

router.post('/compile/cpp', cppCompilation);

router.post('/compile/java', javaCompilation);

router.post('/compile/python', pythonCompilation);

router.post('/execute', executeCppCode);

export default router;

