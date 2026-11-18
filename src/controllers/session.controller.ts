import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SessionService } from '../services/session.service';
import { sendSuccess } from '../utils/apiResponse';

export class SessionController {
  public static createSession = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId, startTime, endTime } = req.body;
    const session = await SessionService.createSession({ teacherId, startTime, endTime });
    return sendSuccess(res, 201, 'Session created successfully', session);
  });

  public static getAvailableSessions = asyncHandler(async (req: Request, res: Response) => {
    const dateTimestamp = req.query.dateTimestamp as string;
    const sessions = await SessionService.getAvailableSessions(dateTimestamp);
    return sendSuccess(res, 200, 'Available sessions retrieved successfully', sessions);
  });

  // API 4: Book Session
  public static bookSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;

    const session = await SessionService.bookSession(id as string, userId as string);
    return sendSuccess(res, 200, 'Session booked successfully', session);
  });

  // API 5: Mark Session Complete
  public static completeSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const session = await SessionService.completeSession(id as string);
    return sendSuccess(res, 200, 'Session marked as completed', session);
  });
}
