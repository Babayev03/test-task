import { Types } from "mongoose";

export default interface IReservation {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  venue: Types.ObjectId;
  date: string;
  time: string;
  numberOfPeople: number;
}
