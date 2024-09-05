import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import { injectModels } from "./injectModels";
import redisLoader from "./redis";

export default async function loaders({ expressApp }) {
  console.log("✌️ Loaders initiated");

  await mongooseLoader();
  console.log("✌️ DB loaded and connected!");

  injectModels();

  await redisLoader();

  expressApp = expressLoader({ app: expressApp });
  console.log("✌️ Express loaded");

  return expressApp;
}
