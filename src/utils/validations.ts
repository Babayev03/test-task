import { body, param, query } from "express-validator";

export const registerValidation = [
  body("userName")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage(
      "Password must be at least 8 characters long and contain at least one letter and one number"
    ),
];

export const loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),
];

export const updateRoleValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),
];

export const createVenueValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isString()
    .withMessage("Location must be a string"),
  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isNumeric()
    .withMessage("Capacity must be a number"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
];

export const getAllVenuesValidation = [
  query("page")
    .optional()
    .isNumeric()
    .withMessage("Page must be a number")
    .not()
    .equals("0"),
  query("limit")
    .optional()
    .isNumeric()
    .withMessage("Limit must be a number")
    .not()
    .equals("0"),
  query("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
];

export const getVenueByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be a valid MongoId"),
];

export const updateVenueValidation = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be a valid MongoId"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
  body("capacity")
    .optional()
    .isNumeric()
    .withMessage("Capacity must be a number"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

export const createReservationValidation = [
  body("venueId")
    .notEmpty()
    .withMessage("VenueId is required")
    .isString()
    .withMessage("VenueId must be a string")
    .isMongoId()
    .withMessage("VenueId must be a valid MongoId"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isString()
    .withMessage("Date must be a string")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in the format YYYY-MM-DD")
    .custom((value) => {
      const [year, month, day] = value.split("-").map(Number);
      if (month < 1 || month > 12) {
        throw new Error("Month must be between 01 and 12");
      }
      if (day < 1 || day > 31) {
        throw new Error("Day must be between 01 and 31");
      }
      return true;
    }),
  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .isString()
    .withMessage("Time must be a string")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Time must be in the format HH:mm")
    .custom((value) => {
      const [hour, minute] = value.split(":").map(Number);
      if (hour < 0 || hour > 23) {
        throw new Error("Hour must be between 00 and 23");
      }
      if (minute < 0 || minute > 59) {
        throw new Error("Minute must be between 00 and 59");
      }
      return true;
    }),
  body("numberOfPeople")
    .notEmpty()
    .withMessage("NumberOfPeople is required")
    .isNumeric()
    .withMessage("NumberOfPeople must be a number"),
];

export const getReservationByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be a valid MongoId"),
];
