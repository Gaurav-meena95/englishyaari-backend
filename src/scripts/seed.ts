import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/user.model';
import { Teacher } from '../models/teacher.model';
import { Session } from '../models/session.model';
import { SessionStatus } from '../constants/sessionStatus';

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('Seeding initial data...');

    // Clear existing test data
    await Session.deleteMany({});
    await Teacher.deleteMany({});
    await User.deleteMany({});

    // 1. Seed Users
    const users = await User.create([
      {
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+919876543210',
      },
      {
        fullName: 'Ananya Gupta',
        email: 'ananya.gupta@example.com',
        phone: '+919876543211',
      },
    ]);
    console.log(`Created ${users.length} users`);

    // 2. Seed Teachers
    const teachers = await Teacher.create([
      {
        fullName: 'Dr. Priya Mehta',
        email: 'priya.mehta@englishyaari.com',
        specialization: 'Business English & Public Speaking',
        experience: 7,
      },
      {
        fullName: 'Vikram Sengupta',
        email: 'vikram.sengupta@englishyaari.com',
        specialization: 'IELTS / TOEFL Prep & Accent Neutralization',
        experience: 5,
      },
    ]);
    console.log(`Created ${teachers.length} teachers`);

    // 3. Seed Sessions for today
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const slot1Start = new Date(today.getTime() + 10 * 3600 * 1000); // 10:00 UTC
    const slot1End = new Date(today.getTime() + 10.75 * 3600 * 1000); // 10:45 UTC

    const slot2Start = new Date(today.getTime() + 12 * 3600 * 1000); // 12:00 UTC
    const slot2End = new Date(today.getTime() + 12.75 * 3600 * 1000); // 12:45 UTC

    const slot3Start = new Date(today.getTime() + 14 * 3600 * 1000); // 14:00 UTC
    const slot3End = new Date(today.getTime() + 14.75 * 3600 * 1000); // 14:45 UTC

    await Session.create([
      // Available slot
      {
        teacherId: teachers[0]._id,
        userId: null,
        startTime: slot1Start,
        endTime: slot1End,
        status: SessionStatus.AVAILABLE,
        completedAt: null,
      },
      // Booked upcoming slot for Rahul
      {
        teacherId: teachers[1]._id,
        userId: users[0]._id,
        startTime: slot2Start,
        endTime: slot2End,
        status: SessionStatus.BOOKED,
        completedAt: null,
      },
      // Completed slot for Rahul
      {
        teacherId: teachers[0]._id,
        userId: users[0]._id,
        startTime: slot3Start,
        endTime: slot3End,
        status: SessionStatus.COMPLETED,
        completedAt: new Date(slot3End.getTime() + 300 * 1000),
      },
    ]);

    console.log('Database seeded successfully with sample Users, Teachers, and Sessions!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  }
};

seedDatabase();
