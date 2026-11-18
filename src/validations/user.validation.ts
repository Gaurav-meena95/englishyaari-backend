import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = (val: string) => mongoose.Types.ObjectId.isValid(val);

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  }),
});

// API 6: User sessions validation
export const getUserSessionsSchema = z.object({
  params: z.object({
    id: z.string().refine(objectIdValidator, { message: 'Invalid user ID format' }),
  }),
});