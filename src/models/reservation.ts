import mongoose, { Schema } from "mongoose";
import IReservation from "../interfaces/IReservation";

const Reservation = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const ReservationModel = mongoose.model<IReservation & mongoose.Document>(
  "Reservation",
  Reservation
);
export default ReservationModel;
