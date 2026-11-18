import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';

export class UserController {
  public static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, phone } = req.body;

    const user = await UserService.createUser({ fullName, email, phone });

    return sendSuccess(res, 201, 'User created successfully', user);
  });
}