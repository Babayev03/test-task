import { Types } from "mongoose";
import ReservationService from "../services/reservation";

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

describe("ReservationService", () => {
  let reservationService: ReservationService;
  let mockUserModel: any;
  let mockVenueModel: any;
  let mockReservationModel: any;

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

    reservationService = new ReservationService(
      mockUserModel,
      mockVenueModel,
      mockReservationModel
    );
  });

  describe("createReservation", () => {
    it("should create a reservation successfully", async () => {
      const mockUserId = new Types.ObjectId();
      const mockVenueId = new Types.ObjectId();
      const mockUser = { _id: mockUserId };
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
    });
  });
  describe("getReservationsByUserId", () => {
    it("should return reservations for a user", async () => {
      const mockUserId = new Types.ObjectId();
      const mockUser = { _id: mockUserId };
      const mockReservations = [{}, {}, {}];

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockReservationModel.find.mockResolvedValue(mockReservations);

      const result = await reservationService.getReservationsByUserId(
        mockUserId
      );

      expect(result).toEqual(mockReservations);
    });

    it("should throw an error if user not found", async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        reservationService.getReservationsByUserId(new Types.ObjectId())
      ).rejects.toEqual({ status: 404, message: "userNotFound" });
    });
  });

  describe("getReservationById", () => {
    it("should return a reservation by ID for a user", async () => {
      const mockUserId = new Types.ObjectId();
      const mockReservationId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };
      const mockReservation = { _id: mockReservationId };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      const result = await reservationService.getReservationById(
        mockUserId,
        mockReservationId
      );

      expect(result).toEqual(mockReservation);
    });

    it("should throw an error if user not found", async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        reservationService.getReservationById(
          new Types.ObjectId(),
          new Types.ObjectId()
        )
      ).rejects.toEqual({ status: 404, message: "userNotFound" });
    });

    it("should throw an error if reservation not found", async () => {
      const mockUserId = new Types.ObjectId();
      const mockReservationId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockReservationModel.findOne.mockResolvedValue(null);

      await expect(
        reservationService.getReservationById(mockUserId, mockReservationId)
      ).rejects.toEqual({ status: 404, message: "reservationNotFound" });
    });
  });

  describe("deleteReservation", () => {
    it("should delete reservation if user is admin", async () => {
      const adminUserId = new Types.ObjectId();
      const reservationId = new Types.ObjectId();
      const reservation = { _id: reservationId };
      const adminUser = { _id: adminUserId, role: "admin" }; // Admin user

      mockUserModel.findById.mockResolvedValue(adminUser);
      mockReservationModel.findOne.mockResolvedValue(reservation);

      const result = await reservationService.deleteReservation(
        adminUserId,
        reservationId
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(adminUserId);
      expect(mockReservationModel.findOne).toHaveBeenCalledWith({
        _id: reservationId,
        $or: expect.arrayContaining([{}]), // Admin can access any reservation
      });
      expect(mockReservationModel.deleteOne).toHaveBeenCalledWith({
        _id: reservationId,
      });
      expect(result).toEqual(reservation);
    });

    it("should delete reservation if valid", async () => {
      const userId = new Types.ObjectId();
      const reservationId = new Types.ObjectId();
      const reservation = { _id: reservationId };
      const user = { _id: userId, role: "user" }; // Non-admin user

      mockUserModel.findById.mockResolvedValue(user);
      mockReservationModel.findOne.mockResolvedValue(reservation);

      const result = await reservationService.deleteReservation(
        userId,
        reservationId
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockReservationModel.findOne).toHaveBeenCalledWith({
        _id: reservationId,
        $or: expect.arrayContaining([{ user: userId }]), // Adjusted to expect array with the user condition
      });
      expect(mockReservationModel.deleteOne).toHaveBeenCalledWith({
        _id: reservationId,
      });
      expect(result).toEqual(reservation);
    });

    it("should throw an error if user not found", async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        reservationService.deleteReservation(
          new Types.ObjectId(),
          new Types.ObjectId()
        )
      ).rejects.toEqual({ status: 404, message: "userNotFound" });
    });

    it("should throw an error if reservation not found", async () => {
      const mockUserId = new Types.ObjectId();
      const mockReservationId = new Types.ObjectId();
      const mockUser = { _id: mockUserId, role: "user" };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockReservationModel.findOne.mockResolvedValue(null);

      await expect(
        reservationService.deleteReservation(mockUserId, mockReservationId)
      ).rejects.toEqual({ status: 404, message: "reservationNotFound" });
    });
  });
});
