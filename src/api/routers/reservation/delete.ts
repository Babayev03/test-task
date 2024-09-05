import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import ReservationService from "../../../services/reservation";
import { Types } from "mongoose";
import { getReservationByIdValidation } from "../../../utils/validations";

export default (app: Router, route: Router) => {
  route.delete(
    "/:id",
    middlewares.isAuth,
    middlewares.checkPermission("read_reservation"),
    getReservationByIdValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reservationService = Container.get(ReservationService);

        const userId = req.token._id;
        const { id } = req.params;

        const response = await reservationService.deleteReservation(
          new Types.ObjectId(userId),
          new Types.ObjectId(id)
        );

        return res.status(202).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
