import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import ReservationService from "../../../services/reservation";
import { Types } from "mongoose";

export default (app: Router, route: Router) => {
  route.get(
    "/",
    middlewares.isAuth,
    middlewares.checkPermission("read_reservation"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reservationService = Container.get(ReservationService);

        const userId = req.token._id;

        const response = await reservationService.getReservationsByUserId(
          new Types.ObjectId(userId)
        );

        return res.status(200).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
