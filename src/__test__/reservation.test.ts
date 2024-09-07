import { Types } from "mongoose";
import ReservationService from "../services/reservation";
import nodemailer from "nodemailer";
import { sendMail } from "../utils/sendMail";

jest.mock("moment-timezone", () => {
  const actualMoment = jest.requireActual("moment");
  const mockMoment = (date?: string) => {
    const instance = actualMoment(date);
    instance.tz = jest.fn().mockReturnValue(instance);
    return instance;
  };
  mockMoment.tz = jest.fn().mockImplementation((...args) => {
    const instance = mockMoment(...args);
    instance.isBefore = jest.fn();
    return instance;
  });
  mockMoment.isBefore = jest.fn().mockReturnValue(true);
  return mockMoment;
});

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue("Email sent"),
  }),
}));

jest.mock("../utils/sendMail", () => ({
  sendMail: jest.fn().mockResolvedValue("Email sent"),
}));

describe("ReservationService", () => {
  let reservationService: ReservationService;
  let mockUserModel: any;
  let mockVenueModel: any;
  let mockReservationModel: any;
  let mockRedisClient: any;

  beforeEach(() => {
    mockUserModel = {
      findById: jest.fn(),
    };
    mockVenueModel = {
      findById: jest.fn(),
    };
    mockReservationModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
    };
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    reservationService = new ReservationService(
      mockUserModel,
      mockVenueModel,
      mockReservationModel,
      mockRedisClient
    );
  });

  describe("createReservation", () => {
    it("should create a reservation successfully and clear Redis cache", async () => {
      const mockUserId = new Types.ObjectId();
      const mockVenueId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, email: "user@example.com" };
      const mockVenue = { _id: mockVenueId, capacity: 100 };
      const mockReservation = {
        _id: new Types.ObjectId(),
        user: mockUserId,
        venue: mockVenueId,
        date: "2024-09-05",
        time: "04:00",
        numberOfPeople: 50,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockVenueModel.findById.mockResolvedValue(mockVenue);
      mockReservationModel.findOne.mockResolvedValue(null);
      mockReservationModel.create.mockResolvedValue(mockReservation);

      const result = await reservationService.createReservation(
        mockUserId,
        mockVenueId,
        "2024-09-06",
        "05:00",
        50
      );

      expect(result).toEqual(mockReservation);
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        `reservations_user_${mockUserId}`
      );
      expect(mockRedisClient.del).toHaveBeenCalledWith(`reservations_admin`);
    });
  });

  describe("getReservationsByUserId", () => {
    it("should return reservations from cache", async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };
      const cachedReservations = [{}, {}, {}];

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedReservations));

      const result = await reservationService.getReservationsByUserId(
        mockUserId
      );

      expect(result).toEqual(cachedReservations);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `reservations_user_${mockUserId}`
      );
    });

    it("should return reservations from the database and cache them", async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };
      const mockReservations = [{}, {}, {}];

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationModel.find.mockResolvedValue(mockReservations);

      const result = await reservationService.getReservationsByUserId(
        mockUserId
      );

      expect(result).toEqual(mockReservations);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `reservations_user_${mockUserId}`
      );
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `reservations_user_${mockUserId}`,
        JSON.stringify(mockReservations),
        { EX: 60 * 60 * 24 }
      );
    });
  });

  describe("getReservationById", () => {
    it("should return reservation from cache", async () => {
      const mockUserId = new Types.ObjectId();
      const mockReservationId = new Types.ObjectId();
      const mockUser = { _id: mockUserId };
      const cachedReservation = { _id: mockReservationId };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedReservation));

      const result = await reservationService.getReservationById(
        mockUserId,
        mockReservationId
      );

      expect(JSON.stringify(result)).toEqual(JSON.stringify(cachedReservation));
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `reservation_${mockReservationId}`
      );
    });

    it("should return reservation from the database and cache it", async () => {
      const mockUserId = new Types.ObjectId();
      const mockReservationId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };
      const mockReservation = { _id: mockReservationId };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(null);
      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      const result = await reservationService.getReservationById(
        mockUserId,
        mockReservationId
      );

      expect(result).toEqual(mockReservation);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `reservation_${mockReservationId}`,
        JSON.stringify(mockReservation),
        { EX: 60 * 60 * 24 }
      );
    });
  });

  describe("deleteReservation", () => {
    it("should delete reservation and clear Redis cache", async () => {
      const userId = new Types.ObjectId();
      const reservationId = new Types.ObjectId();
      const reservation = { _id: reservationId };
      const user = { _id: userId, role: "user" };

      mockUserModel.findById.mockResolvedValue(user);
      mockReservationModel.findOne.mockResolvedValue(reservation);

      const result = await reservationService.deleteReservation(
        userId,
        reservationId
      );

      expect(result).toEqual(reservation);
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        `reservations_user_${userId}`
      );
      expect(mockRedisClient.del).toHaveBeenCalledWith(`reservations_admin`);
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        `reservation_${reservationId}`
      );
    });
  });
});
