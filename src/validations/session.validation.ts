import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = (val: string) => mongoose.Types.ObjectId.isValid(val);

export const createSessionSchema = z.object({
  body: z
    .object({
      teacherId: z.string().refine(objectIdValidator, {
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

export const getAvailableSessionsSchema = z.object({
  query: z.object({
    dateTimestamp: z.string({
      required_error: 'dateTimestamp query parameter is required',
    }),
  }),
});

// API 4: Book Session Validation
export const bookSessionSchema = z.object({
  params: z.object({
    id: z.string().refine(objectIdValidator, { message: 'Invalid session ID' }),
  }),
  body: z.object({
    userId: z.string().refine(objectIdValidator, { message: 'Invalid user ID' }),
  }),
});

// API 5: Complete Session Validation
export const completeSessionSchema = z.object({
  params: z.object({
    id: z.string().refine(objectIdValidator, { message: 'Invalid session ID' }),
  }),
});