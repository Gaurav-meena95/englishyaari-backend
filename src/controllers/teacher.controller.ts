import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { TeacherService } from '../services/teacher.service';
import { sendSuccess } from '../utils/apiResponse';

export class TeacherController {
  public static createTeacher = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, specialization, experience } = req.body;
    const teacher = await TeacherService.createTeacher({ fullName, email, specialization, experience });
    return sendSuccess(res, 201, 'Teacher created successfully', teacher);
  });

  public static getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
    const teachers = await TeacherService.getAllTeachers();
    return sendSuccess(res, 200, 'Teachers fetched successfully', teachers);
  });
}