import { Teacher } from '../models/teacher.model';
import { AppError } from '../utils/AppError';

interface CreateTeacherInput {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}

export class TeacherService {
  public static async createTeacher(input: CreateTeacherInput): Promise<Teacher> {
    const existingTeacher = await Teacher.findOne({ email: input.email.toLowerCase().trim() });

    if (existingTeacher) {
      throw new AppError('A teacher with this email already exists', 409);
    }

    const teacher = await Teacher.create({
      fullName: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      specialization: input.specialization.trim(),
      experience: input.experience,
    });

    return teacher;
  }

  public static async getAllTeachers(): Promise<Teacher[]> {
    return Teacher.find().sort({ createdAt: -1 });
  }
}