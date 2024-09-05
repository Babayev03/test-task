import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import VenueService from "../../../services/venue";
import { getAllVenuesValidation } from "../../../utils/validations";

export default (app: Router, route: Router) => {
  route.get(
    "/",
    middlewares.isAuth,
    getAllVenuesValidation,
    middlewares.validate,
    middlewares.checkPermission("read_venue"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const venueService = Container.get(VenueService);

        const { limit = 10, page = 1, location } = req.query;

        const response = await venueService.getAllVenues(
          Number(page),
          Number(limit),
          location?.toString()
        );

        return res.status(200).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
