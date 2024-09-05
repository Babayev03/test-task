import "reflect-metadata";
import { Container } from "typedi";
import { Types } from "mongoose";
import VenueService from "../services/venue";
import IVenue from "../interfaces/IVenue";

const mockUserModel = {
  findById: jest.fn(),
};

const mockVenueModel = {
  find: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  create: jest.fn(),
};

Container.set("venueModel", mockVenueModel);
Container.set("userModel", mockUserModel);

describe("VenueService", () => {
  let venueService: VenueService;

  beforeEach(() => {
    venueService = Container.get(VenueService);
    jest.clearAllMocks();
  });

  describe("getVenueById", () => {
    it("should return a venue by ID", async () => {
      const venueId = new Types.ObjectId();
      const venue = {
        name: "Test Venue",
        createdBy: { email: "test@example.com", userName: "testuser" },
      };

      mockVenueModel.findById.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(venue);

      const result = await venueService.getVenueById(venueId);

      expect(mockVenueModel.findById).toHaveBeenCalledWith(venueId);
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
      expect(result).toEqual(venue);
    });

    it("should throw a 404 error if venue not found", async () => {
      const venueId = new Types.ObjectId();
      mockVenueModel.findById.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(venueService.getVenueById(venueId)).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });

      expect(mockVenueModel.findById).toHaveBeenCalledWith(venueId);
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
    });
  });

  describe("updateVenue", () => {
    it("should update a venue if found", async () => {
      const venueId = new Types.ObjectId();
      const updatedData = { name: "Updated Venue" };
      const updatedVenue = {
        ...updatedData,
        createdBy: { email: "test@example.com", userName: "testuser" },
      };

      mockVenueModel.findByIdAndUpdate.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(updatedVenue);

      const result = await venueService.updateVenue(venueId, updatedData.name);

      expect(mockVenueModel.findByIdAndUpdate).toHaveBeenCalledWith(
        venueId,
        { name: updatedData.name },
        { new: true }
      );
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
      expect(result).toEqual(updatedVenue);
    });

    it("should throw a 404 error if venue not found", async () => {
      const venueId = new Types.ObjectId();
      mockVenueModel.findByIdAndUpdate.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(
        venueService.updateVenue(venueId, "Updated Venue")
      ).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });

      expect(mockVenueModel.findByIdAndUpdate).toHaveBeenCalledWith(
        venueId,
        { name: "Updated Venue" },
        { new: true }
      );
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
    });
  });

  describe("deleteVenue", () => {
    it("should delete a venue if found", async () => {
      const venueId = new Types.ObjectId();
      const deletedVenue = {
        name: "Deleted Venue",
        createdBy: { email: "test@example.com", userName: "testuser" },
      };

      mockVenueModel.findByIdAndDelete.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(deletedVenue);

      const result = await venueService.deleteVenue(venueId);

      expect(mockVenueModel.findByIdAndDelete).toHaveBeenCalledWith(venueId);
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
      expect(result).toEqual(deletedVenue);
    });

    it("should throw a 404 error if venue not found", async () => {
      const venueId = new Types.ObjectId();
      mockVenueModel.findByIdAndDelete.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(venueService.deleteVenue(venueId)).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });

      expect(mockVenueModel.findByIdAndDelete).toHaveBeenCalledWith(venueId);
      expect(mockVenueModel.populate).toHaveBeenCalledWith(
        "createdBy",
        "email userName"
      );
    });
  });
});
