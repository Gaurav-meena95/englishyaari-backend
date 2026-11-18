import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createTeacherSchema } from '../validations/teacher.validation';

const router = Router();

router.post('/', validateRequest(createTeacherSchema), TeacherController.createTeacher);
router.get('/', TeacherController.getAllTeachers);

export default router;