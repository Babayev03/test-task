import { Router } from "express";
import create from "./create";
import getAll from "./getAll";
import getById from "./getById";
import update from "./update";
import deleteVenue from "./delete";
const route = Router();

export default (app: Router) => {
  app.use("/venues", route);
  create(app, route);
  getAll(app, route);
  getById(app, route);
  update(app, route);
  deleteVenue(app, route);
  return app;
};
