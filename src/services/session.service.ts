import mongoose from 'mongoose';
import { Session } from '../models/session.model';
import { Teacher } from '../models/teacher.model';
import { SessionStatus } from '../constants/sessionStatus';
import { AppError } from '../utils/AppError';

interface CreateSessionInput {
  teacherId: string;
  startTime: string;
  endTime: string;
}

export class SessionService {
  public static async createSession(input: CreateSessionInput): Promise<Session> {
    // 1. Validate that the teacher exists
    const teacherExists = await Teacher.findById(input.teacherId);
    if (!teacherExists) {
      throw new AppError('Teacher not found', 404);
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    // 2. Validate that endTime is greater than startTime
    if (end.getTime() <= start.getTime()) {
      throw new AppError('endTime must be greater than startTime', 400);
    }

    // 3. Prevent overlapping sessions for the same teacher
    const overlappingSession = await Session.findOne({
      teacherId: new mongoose.Types.ObjectId(input.teacherId),
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (overlappingSession) {
      throw new AppError('Teacher already has an overlapping session in this time slot', 409);
    }

    // 4. Create new session with default status AVAILABLE
    const session = await Session.create({
      teacherId: new mongoose.Types.ObjectId(input.teacherId),
      userId: null,
      startTime: start,
      endTime: end,
      status: SessionStatus.AVAILABLE,
      completedAt: null,
    });

    return session;
  }
}