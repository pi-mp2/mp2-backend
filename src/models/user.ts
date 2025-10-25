import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

/**
 * Interface representing a User document in MongoDB.
 * 
 * Defines all fields, their expected types, and helper methods 
 * for password and security answer comparison.
 */
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  securityQuestion: string;
  securityAnswer: string,
  tokenVersion: number,
  comparePassword(candidate: string): Promise<boolean>;
  compareSecurityAnswer(answer: string): Promise<boolean>;
}

// 2. Creamos el esquema con validaciones
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [13, "User must be at least 13 years old"],
      max: [120, "Age cannot exceed 120 years"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    securityQuestion: { 
      type: String, 
      required: [true, "Security Question is required"],
    },
    securityAnswer: { 
      type: String, 
      required: [true, "Security Answer is required"],
    },
    tokenVersion: { 
      type: Number, 
      default: 0
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

/**
 * Pre-save middleware: hashes the user's password and security answer 
 * before saving if they were modified.
 */
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified("securityAnswer")) {
      this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

/**
 * Compares a plain-text password with the hashed password.
 * @param candidate - The password entered by the user.
 * @returns Promise resolving to `true` if passwords match, otherwise `false`.
 */
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Compares a plain-text security answer with the hashed stored answer.
 * @param candidate - The security answer entered by the user.
 * @returns Promise resolving to `true` if answers match, otherwise `false`.
 */
userSchema.methods.compareSecurityAnswer = function (candidate: string) {
  return bcrypt.compare(candidate, this.securityAnswer);
};

/**
 * Mongoose model for the User collection.
 */
export const User = model<IUser>("User", userSchema);
