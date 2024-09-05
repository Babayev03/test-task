import mongoose, { Schema } from "mongoose";
import IVenue from "../interfaces/IVenue";

const Venue = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

const VenueModel = mongoose.model<IVenue & mongoose.Document>("Venue", Venue);
export default VenueModel;
