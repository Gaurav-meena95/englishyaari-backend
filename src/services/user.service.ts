import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Session } from '../models/session.model';
import { SessionStatus } from '../constants/sessionStatus';
import { AppError } from '../utils/AppError';

interface CreateUserInput {
  fullName: string;
  email: string;
  phone: string;
}

export interface UserSessionsResult {
  upcomingSessions: any[];
  completedSessions: any[];
}

export class UserService {
  public static async createUser(input: CreateUserInput): Promise<User> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase().trim() });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const user = await User.create({
      fullName: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      phone: input.phone.trim(),
    });

    return user;
  }

  // API 6: Mandatory MongoDB Aggregation Pipeline with $facet
  public static async getUserSessions(userId: string): Promise<UserSessionsResult> {
    // 1. Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError('User not found', 404);
    }

    // 2. Aggregation pipeline utilizing $facet for single-trip multi-bucket categorization
    const result = await Session.aggregate([
      // Stage 1: Match sessions belonging to this user
      // Utilizes compound index { userId: 1, status: 1 }
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      // Stage 2: Join teacher information for context
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },

      // Stage 3: Flatten teacher array
      {
        $unwind: {
          path: '$teacher',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 4: Multi-faceted aggregation (splits into upcoming and completed streams)
      {
        $facet: {
          upcomingSessions: [
            {
              $match: {
                status: SessionStatus.BOOKED,
              },
            },
            {
              $sort: { startTime: 1 },
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
                  specialization: '$teacher.specialization',
                },
                createdAt: 1,
              },
            },
          ],
          completedSessions: [
            {
              $match: {
                status: SessionStatus.COMPLETED,
              },
            },
            {
              $sort: { completedAt: -1 },
            },
            {
              $project: {
                _id: 1,
                startTime: 1,
                endTime: 1,
                status: 1,
                completedAt: 1,
                teacher: {
                  _id: '$teacher._id',
                  fullName: '$teacher.fullName',
                  specialization: '$teacher.specialization',
                },
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const categorizedSessions = result[0] || {
      upcomingSessions: [],
      completedSessions: [],
    };

    return categorizedSessions;
  }
}
