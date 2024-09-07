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

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

Container.set("venueModel", mockVenueModel);
Container.set("userModel", mockUserModel);
Container.set("redisClient", mockRedisClient);

describe("VenueService", () => {
  let venueService: VenueService;

  beforeEach(() => {
    venueService = Container.get(VenueService);
    jest.clearAllMocks();
  });

  describe("getVenueById", () => {
    it("should return a venue from cache if available", async () => {
      const venueId = new Types.ObjectId();
      const cachedVenue = { name: "Cached Venue" };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedVenue));

      const result = await venueService.getVenueById(venueId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`venue_${venueId}`);
      expect(result).toEqual(cachedVenue);
    });

    it("should fetch venue from DB and cache if not in cache", async () => {
      const venueId = new Types.ObjectId();
      const venue = {
        name: "DB Venue",
        createdBy: { email: "test@example.com", userName: "testuser" },
      };

      mockRedisClient.get.mockResolvedValue(null); // Cache miss
      mockVenueModel.findById.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(venue);

      const result = await venueService.getVenueById(venueId);

      expect(mockVenueModel.findById).toHaveBeenCalledWith(venueId);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `venue_${venueId}`,
        JSON.stringify(venue),
        { EX: 60 * 60 * 24 }
      );
      expect(result).toEqual(venue);
    });

    it("should throw a 404 error if venue not found", async () => {
      const venueId = new Types.ObjectId();
      mockRedisClient.get.mockResolvedValue(null); // Cache miss
      mockVenueModel.findById.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(venueService.getVenueById(venueId)).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });
    });
  });

  describe("updateVenue", () => {
    it("should update and invalidate cache for a venue", async () => {
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
      expect(mockRedisClient.del).toHaveBeenCalledWith(`venue_${venueId}`);
      expect(mockRedisClient.del).toHaveBeenCalledWith("all_venues");
      expect(result).toEqual(updatedVenue);
    });

    it("should throw a 404 error if venue not found for update", async () => {
      const venueId = new Types.ObjectId();
      mockVenueModel.findByIdAndUpdate.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(
        venueService.updateVenue(venueId, "Updated Venue")
      ).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });
    });
  });

  describe("deleteVenue", () => {
    it("should delete a venue and clear cache", async () => {
      const venueId = new Types.ObjectId();
      const deletedVenue = {
        name: "Deleted Venue",
        createdBy: { email: "test@example.com", userName: "testuser" },
      };

      mockVenueModel.findByIdAndDelete.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(deletedVenue);

      const result = await venueService.deleteVenue(venueId);

      expect(mockVenueModel.findByIdAndDelete).toHaveBeenCalledWith(venueId);
      expect(mockRedisClient.del).toHaveBeenCalledWith(`venue_${venueId}`);
      expect(mockRedisClient.del).toHaveBeenCalledWith("all_venues");
      expect(result).toEqual(deletedVenue);
    });

    it("should throw a 404 error if venue not found for delete", async () => {
      const venueId = new Types.ObjectId();
      mockVenueModel.findByIdAndDelete.mockReturnThis();
      mockVenueModel.populate.mockResolvedValue(null);

      await expect(venueService.deleteVenue(venueId)).rejects.toEqual({
        status: 404,
        message: "venueNotFound",
      });
    });
  });
});
