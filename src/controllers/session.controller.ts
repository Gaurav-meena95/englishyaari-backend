import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SessionService } from '../services/session.service';
import { sendSuccess } from '../utils/apiResponse';

export class SessionController {
  public static createSession = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId, startTime, endTime } = req.body;

    const session = await SessionService.createSession({
      teacherId,
      startTime,
      endTime,
    });

    return sendSuccess(res, 201, 'Session created successfully', session);
  });
}