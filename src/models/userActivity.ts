import mongoose, { Schema, Document } from "mongoose";

export interface IUserActivity extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

export const UserActivity = mongoose.model<IUserActivity>("UserActivity", userActivitySchema);
