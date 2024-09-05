import { Inject, Service } from "typedi";
import { Models, Types } from "mongoose";
import IReservation from "../interfaces/IReservation";
import moment from "moment-timezone";

@Service()
export default class ReservationService {
  constructor(
    @Inject("userModel") private userModel: Models.UserModel,
    @Inject("venueModel") private venueModel: Models.VenueModel,
    @Inject("reservationModel")
    private reservationModel: Models.ReservationModel
  ) {}

  public async createReservation(
    userId: Types.ObjectId,
    venueId: Types.ObjectId,
    date: string,
    time: string,
    numberOfPeople: number
  ): Promise<IReservation> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const venue = await this.venueModel.findById(venueId);
      if (!venue) {
        throw { status: 404, message: "venueNotFound" };
      }

      if (venue.capacity < numberOfPeople) {
        throw { status: 400, message: "venueCapacityExceeded" };
      }

      this.validateReservationTime(date, time);

      const reservationControl = await this.reservationModel.findOne({
        venue: venueId,
        date,
        time,
      });

      if (reservationControl) {
        throw { status: 400, message: "reservationAlreadyExists" };
      }

      const reservation = await this.reservationModel.create({
        user: userId,
        venue: venueId,
        date,
        time,
        numberOfPeople,
      });

      return reservation;
    } catch (error) {
      throw error;
    }
  }

  public async getReservationsByUserId(
    userId: Types.ObjectId
  ): Promise<IReservation[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const reservations = await this.reservationModel.find({ user: userId });

      return reservations;
    } catch (error) {
      throw error;
    }
  }

  public async getReservationById(
    userId: Types.ObjectId,
    reservationId: Types.ObjectId
  ): Promise<IReservation> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const reservation = await this.findReservationByIdAndUser(
        reservationId,
        userId,
        user.role
      );

      return reservation;
    } catch (error) {
      throw error;
    }
  }

  public async deleteReservation(
    userId: Types.ObjectId,
    reservationId: Types.ObjectId
  ): Promise<IReservation> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const reservation = await this.findReservationByIdAndUser(
        reservationId,
        userId,
        user.role
      );

      await this.reservationModel.deleteOne({ _id: reservationId });

      return reservation;
    } catch (error) {
      throw error;
    }
  }

  private validateReservationTime(date: string, time: string): void {
    const reservationDateTime = moment.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Baku"
    );
    if (reservationDateTime.isBefore(moment().tz("Asia/Baku"))) {
      throw { status: 400, message: "reservationTimeInPast" };
    }
  }

  private async findReservationByIdAndUser(
    reservationId: Types.ObjectId,
    userId: Types.ObjectId,
    userRole: string
  ): Promise<IReservation> {
    const reservation = await this.reservationModel.findOne({
      _id: reservationId,
      $or: [
        { user: userId },
        { ...(userRole === "admin" ? {} : { user: userId }) },
      ],
    });

    if (!reservation) {
      throw { status: 404, message: "reservationNotFound" };
    }

    return reservation;
  }
}
