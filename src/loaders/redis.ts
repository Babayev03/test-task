import { createClient } from "redis";
import logger from "../utils/logger";
import Container from "typedi";
import config from "../config";

const redisLoader = async () => {
  const redisClient = createClient({
    url: config.redis_url,
  });

  redisClient.on("error", (err) => {
    logger.error(`Redis Client Error: ${err.message}`);
  });

  redisClient.on("ready", () => {
    console.log("✌️ Redis Client connected and ready to use");
  });

  await redisClient.connect();

  Container.set("redisClient", redisClient);

  return redisClient;
};

export default redisLoader;
