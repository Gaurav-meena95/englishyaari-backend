import { Schema, model, Document } from 'mongoose';

export interface Teacher extends Document {
    fullName: string;
    email: string;
    specialization: string;
    experience: number;
    createdAt: Date;
    updatedAt: Date;
}

const teacherSchema = new Schema<Teacher>(
    {
        fullName: {
            type: String,
            required: [true, 'Teacher full name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Teacher email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        specialization: {
            type: String,
            required: [true, 'Specialization is required'],
            trim: true,
        },
        experience: {
            type: Number,
            required: [true, 'Years of experience is required'],
            min: [0, 'Experience cannot be negative'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Teacher = model<Teacher>('Teacher', teacherSchema);