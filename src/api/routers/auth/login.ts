import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";
import { loginValidation } from "../../../utils/validations";
import middlewares from "../../../api/middlewares";

export default (app: Router, route: Router) => {
  route.post(
    "/login",
    loginValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { email, password } = req.body;

        const { user } = await authService.loginUser(email, password);

        return res.status(200).json(user);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
