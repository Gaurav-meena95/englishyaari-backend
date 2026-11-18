import { z } from 'zod';
import mongoose from 'mongoose';

export const createSessionSchema = z.object({
  body: z
    .object({
      teacherId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid teacher ID format',
      }),
      startTime: z.string().datetime({ message: 'startTime must be a valid ISO-8601 date string' }),
      endTime: z.string().datetime({ message: 'endTime must be a valid ISO-8601 date string' }),
    })
    .refine(
      (data) => new Date(data.endTime).getTime() > new Date(data.startTime).getTime(),
      {
        message: 'endTime must be greater than startTime',
        path: ['endTime'],
      }
    ),
});