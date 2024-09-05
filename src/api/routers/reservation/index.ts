import { Router } from "express";
import create from "./create";
import getAll from "./getAll";
import getById from "./getById";
import deleteReservation from "./delete";
const route = Router();

export default (app: Router) => {
  app.use("/reservations", route);
  create(app, route);
  getAll(app, route);
  getById(app, route);
  deleteReservation(app, route);
  return app;
};
