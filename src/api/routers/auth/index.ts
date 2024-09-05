import { Router } from "express";
import register from "./register";
import login from "./login";
import updateRole from "./updateRole";

const route = Router();

export default (app: Router) => {
  app.use("/auth", route);
  register(app, route);
  login(app, route);
  updateRole(app, route);
  return app;
};
