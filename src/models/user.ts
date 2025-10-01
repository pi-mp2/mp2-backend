import { Schema, model, Document } from "mongoose";

// 1. Definimos la interfaz TypeScript
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// 3. Exportamos el modelo
export const User = model<IUser>("User", userSchema);