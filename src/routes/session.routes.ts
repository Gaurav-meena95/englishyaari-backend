import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createSessionSchema } from '../validations/session.validation';

const router = Router();


router.post('/', validateRequest(createSessionSchema), SessionController.createSession);

export default router;