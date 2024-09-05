import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import VenueService from "../../../services/venue";
import { Types } from "mongoose";
import { getVenueByIdValidation } from "../../../utils/validations";

export default (app: Router, route: Router) => {
  route.delete(
    "/:id",
    middlewares.isAuth,
    middlewares.checkPermission("delete_venue"),
    getVenueByIdValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const venueService = Container.get(VenueService);

        const { id } = req.params;

        const response = await venueService.deleteVenue(new Types.ObjectId(id));

        return res.status(202).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
