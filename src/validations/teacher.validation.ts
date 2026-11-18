import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    specialization: z.string().min(2, 'Specialization is required'),
    experience: z.number().min(0, 'Experience must be a non-negative number'),
  }),
});