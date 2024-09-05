import { Router } from "express";
import auth from "./routers/auth";
import venue from "./routers/venue";
import reservation from "./routers/reservation";
export default () => {
  const app = Router();
  auth(app);
  venue(app);
  reservation(app);
  return app;
};
