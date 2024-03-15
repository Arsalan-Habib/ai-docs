import mongoose from "mongoose";

export interface IUser {
  email: string;
  hash?: string;
  salt?: string;
  profile: {
    firstName: string;
    lastName: string;
    image: string;
  };
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
    },
    salt: {
      type: String,
    },
    profile: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

export default mongoose.models.users || mongoose.model<IUser>("users", userSchema);
