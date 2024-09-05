import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import VenueService from "../../../services/venue";
import { updateVenueValidation } from "../../../utils/validations";
import { Types } from "mongoose";

export default (app: Router, route: Router) => {
  route.put(
    "/:id",
    middlewares.isAuth,
    middlewares.checkPermission("update_venue"),
    updateVenueValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const venueService = Container.get(VenueService);
        const { name, location, capacity, description } = req.body;
        const { id } = req.params;

        const response = await venueService.updateVenue(
          new Types.ObjectId(id),
          name,
          location,
          capacity,
          description
        );

        return res.status(202).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
