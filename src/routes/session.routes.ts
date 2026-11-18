import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createSessionSchema,
  getAvailableSessionsSchema,
  bookSessionSchema,
  completeSessionSchema,
} from '../validations/session.validation';

const router = Router();

// API 3: Available Sessions for Booking
router.get('/available', validateRequest(getAvailableSessionsSchema), SessionController.getAvailableSessions);

// API 2: Create Session
router.post('/', validateRequest(createSessionSchema), SessionController.createSession);

// API 4: Book Session
router.post('/:id/book', validateRequest(bookSessionSchema), SessionController.bookSession);

// API 5: Mark Session Complete
router.patch('/:id/complete', validateRequest(completeSessionSchema), SessionController.completeSession);

export default router;
