import { Types } from "mongoose";

export default interface IVenue {
  _id: Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
  description: string;
  createdBy: Types.ObjectId;
}
