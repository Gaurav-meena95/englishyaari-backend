import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, getUserSessionsSchema } from '../validations/user.validation';

const router = Router();

// API 1: Create User
router.post('/', validateRequest(createUserSchema), UserController.createUser);

// API 6: User Session List (Upcoming & Completed)
router.get('/:id/sessions', validateRequest(getUserSessionsSchema), UserController.getUserSessions);

export default router;
