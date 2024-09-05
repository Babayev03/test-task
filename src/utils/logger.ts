import { createLogger, format } from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

const logFilePath = path.join(__dirname, "../../logs/");

const logger = createLogger({
  level: "error",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logFilePath, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
