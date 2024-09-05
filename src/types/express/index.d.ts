import IVenue from "../../interfaces/IVenue";
import IUser from "../../interfaces/IUser";
import IReservation from "../../interfaces/IReservation";
import { Document, Model } from "mongoose";

declare global {
  namespace Express {
    export interface Request {
      token: IUser;
    }
  }
  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type VenueModel = Model<IVenue & Document>;
    export type ReservationModel = Model<IReservation & Document>;
  }
}
