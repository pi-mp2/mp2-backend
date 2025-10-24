import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a User Activity document in MongoDB.
 * 
 * Stores information about user actions for auditing, analytics, or security purposes.
 */
export interface IUserActivity extends Document {
  user: mongoose.Types.ObjectId;   // Reference to the User performing the action
  action: string;                  // Description of the performed action
  ipAddress?: string;              // Optional IP address from where the action was performed
  userAgent?: string;              // Optional browser or device information
  createdAt: Date;                 // Automatically generated timestamp of the action
}

/**
 * Mongoose schema for tracking user activities.
 * 
 * Automatically stores timestamps for creation and updates.
 */
const userActivitySchema = new Schema<IUserActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

/**
 * Mongoose model for the "UserActivity" collection.
 * 
 * Used to log actions such as login, profile updates, password changes, or deletions.
 */
export const UserActivity = mongoose.model<IUserActivity>("UserActivity", userActivitySchema);
