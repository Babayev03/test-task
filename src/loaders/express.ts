import express, { Request, Response, NextFunction } from "express";
import config from "../config";
import routes from "../api";

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

  app.use(config.api.prefix, routes());

  app.use(
    (err: CustomError, req: Request, res: Response, next: NextFunction) => {
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
