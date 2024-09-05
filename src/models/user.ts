import mongoose, { Schema } from "mongoose";
import IUser from "../interfaces/IUser";

const User = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
  },
  { timestamps: true, versionKey: false }
);

const UserModel = mongoose.model<IUser & mongoose.Document>("User", User);
export default UserModel;
