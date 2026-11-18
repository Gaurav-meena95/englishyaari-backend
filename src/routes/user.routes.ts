import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema } from '../validations/user.validation';

const router = Router();

router.post('/', validateRequest(createUserSchema), UserController.createUser);

export default router;