import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import { registerValidation } from "../../../utils/validations";

export default (app: Router, route: Router) => {
  route.post(
    "/register",
    registerValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { userName, email, password } = req.body;

        const response = await authService.registerUser(
          userName,
          email,
          password
        );

        return res.status(201).json(response);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
