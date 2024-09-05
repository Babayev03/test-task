import { Request } from "express";
import { publicKey } from "../../../keys/keyUtils";
import { expressjwt as jwt } from "express-jwt";

const getTokenFromHeader = (req: Request) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const isAuth = jwt({
  secret: publicKey,
  algorithms: ["RS256"],
  requestProperty: "token",
  getToken: getTokenFromHeader,
});

export default isAuth;
