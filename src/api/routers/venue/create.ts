import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import VenueService from "../../../services/venue";
import { createVenueValidation } from "../../../utils/validations";
import { Types } from "mongoose";

export default (app: Router, route: Router) => {
  route.post(
    "/",
    middlewares.isAuth,
    middlewares.checkPermission("create_venue"),
    createVenueValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const venueService = Container.get(VenueService);
        const { name, location, capacity, description } = req.body;
        const userId = req.token._id;
        const response = await venueService.createVenue(
          new Types.ObjectId(userId),
          name,
          location,
          capacity,
          description
        );

        return res.status(201).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
