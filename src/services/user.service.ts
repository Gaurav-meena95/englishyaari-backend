import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';

interface CreateUserInput {
  fullName: string;
  email: string;
  phone: string;
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
}