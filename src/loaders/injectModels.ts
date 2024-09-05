import dependencyInjector from "./dependencyInjector";

export function injectModels() {
  const userModel = {
    name: "userModel",
    model: require("../models/user").default,
  };

  const venueModel = {
    name: "venueModel",
    model: require("../models/venue").default,
  };

  const reservationModel = {
    name: "reservationModel",
    model: require("../models/reservation").default,
  };

  dependencyInjector([userModel, venueModel, reservationModel]);

  console.log("✌️ Dependency Injector loaded");
}
