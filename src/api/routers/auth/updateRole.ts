import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";
import { updateRoleValidation } from "../../../utils/validations";
import { Types } from "mongoose";

export default (app: Router, route: Router) => {
  route.put(
    "/update",
    middlewares.isAuth,
    updateRoleValidation,
    middlewares.validate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { password } = req.body;
        const userId = req.token._id;

        const { user } = await authService.updateRole(
          new Types.ObjectId(userId),
          password
        );

        return res.status(200).json(user);
      } catch (e) {
        console.log("error", e);

        return next(e);
      }
    }
  );
};
