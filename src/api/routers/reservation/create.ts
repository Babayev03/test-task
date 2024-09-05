import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import ReservationService from "../../../services/reservation";
import { Types } from "mongoose";
import { createReservationValidation } from "../../../utils/validations";

export default (app: Router, route: Router) => {
  route.post(
    "/",
    middlewares.isAuth,
    middlewares.checkPermission("create_reservation"),
    createReservationValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reservationService = Container.get(ReservationService);

        const userId = req.token._id;
        const { venueId, date, time, numberOfPeople } = req.body;

        const response = await reservationService.createReservation(
          new Types.ObjectId(userId),
          new Types.ObjectId(venueId as string),
          date,
          time,
          numberOfPeople
        );

        return res.status(201).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
