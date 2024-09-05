import express, { Request, Response, NextFunction } from "express";
import config from "../config";
import routes from "../api";
import logger from "../utils/logger";

class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CustomError";
    this.status = status;
  }
}

export default ({ app }: { app: express.Application }) => {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
  });

  app.get("/status", (req, res) => {
    res.status(200).json({ ok: "ok" }).end();
  });

  app.get("/error", (req, res, next) => {
    next(new Error("This is a test error"));
  });

  app.use(config.api.prefix, routes());

  app.use(
    (err: CustomError, req: Request, res: Response, next: NextFunction) => {
      logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        statusCode: err.status || 500,
        clientIp: req.ip,
      });

      res.status(err.status || 500);
      res.json({
        error: {
          message: err.message,
        },
      });
    }
  );

  return app;
};
