import mongoose from 'mongoose';
import { Session } from '../models/session.model';
import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { SessionStatus } from '../constants/sessionStatus';
import { AppError } from '../utils/AppError';
import { getDayRangeFromTimestamp } from '../utils/dateHelper';

interface CreateSessionInput {
  teacherId: string;
  startTime: string;
  endTime: string;
}

export class SessionService {
  public static async createSession(input: CreateSessionInput): Promise<Session> {
    const teacherExists = await Teacher.findById(input.teacherId);
    if (!teacherExists) {
      throw new AppError('Teacher not found', 404);
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    if (end.getTime() <= start.getTime()) {
      throw new AppError('endTime must be greater than startTime', 400);
    }

    const overlappingSession = await Session.findOne({
      teacherId: new mongoose.Types.ObjectId(input.teacherId),
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (overlappingSession) {
      throw new AppError('Teacher already has an overlapping session in this time slot', 409);
    }

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

  // API 3: Mandatory MongoDB Aggregation Pipeline
  public static async getAvailableSessions(dateTimestamp: string): Promise<any[]> {
    const { startOfDay, endOfDay } = getDayRangeFromTimestamp(dateTimestamp);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          status: SessionStatus.AVAILABLE,
          startTime: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: {
          path: '$teacher',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          teacher: {
            _id: '$teacher._id',
            fullName: '$teacher.fullName',
            email: '$teacher.email',
            specialization: '$teacher.specialization',
            experience: '$teacher.experience',
          },
          createdAt: 1,
        },
      },
      {
        $sort: {
          startTime: 1,
        },
      },
    ];

    return Session.aggregate(pipeline);
  }

  // API 4: Atomic Booking Operation
  public static async bookSession(sessionId: string, userId: string): Promise<Session> {
    // 1. Validate that the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError('User not found', 404);
    }

    // 2. Atomic find and update: only succeed if status is currently AVAILABLE
    const updatedSession = await Session.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sessionId),
        status: SessionStatus.AVAILABLE,
      },
      {
        $set: {
          status: SessionStatus.BOOKED,
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true }
    );

    // 3. If update returned null, inspect reason to provide clear error message
    if (!updatedSession) {
      const existingSession = await Session.findById(sessionId);
      if (!existingSession) {
        throw new AppError('Session not found', 404);
      }
      throw new AppError('Session is not available for booking (already booked or completed)', 409);
    }

    return updatedSession;
  }

  // API 5: Complete Session Operation
  public static async completeSession(sessionId: string): Promise<Session> {
    // Atomic find and update: only succeed if status is currently BOOKED
    const completedSession = await Session.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sessionId),
        status: SessionStatus.BOOKED,
      },
      {
        $set: {
          status: SessionStatus.COMPLETED,
          completedAt: new Date(),
        },
      },
      { new: true }
    );

    // If update returned null, inspect reason
    if (!completedSession) {
      const existingSession = await Session.findById(sessionId);
      if (!existingSession) {
        throw new AppError('Session not found', 404);
      }
      if (existingSession.status === SessionStatus.AVAILABLE) {
        throw new AppError('Only booked sessions can be marked as completed', 400);
      }
      if (existingSession.status === SessionStatus.COMPLETED) {
        throw new AppError('Session is already marked as completed', 409);
      }
    }

    return completedSession as Session;
  }
}
