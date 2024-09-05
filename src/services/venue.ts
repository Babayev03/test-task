import { Inject, Service } from "typedi";
import { Models, Types } from "mongoose";
import IVenue from "../interfaces/IVenue";

@Service()
export default class VenueService {
  constructor(
    @Inject("userModel") private userModel: Models.UserModel,
    @Inject("venueModel") private venueModel: Models.VenueModel
  ) {}

  public async createVenue(
    userId: Types.ObjectId,
    name: string,
    location: string,
    capacity: number,
    description: string
  ): Promise<IVenue> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const venue = await this.venueModel.create({
        name,
        location,
        capacity,
        description,
        createdBy: userId,
      });

      return venue;
    } catch (error) {
      throw error;
    }
  }

  public async getAllVenues(
    page: number,
    limit: number,
    location: string
  ): Promise<IVenue[]> {
    try {
      const query = location
        ? { location: { $regex: location, $options: "i" } }
        : {};

      const venues = await this.venueModel
        .find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("createdBy", "email userName");

      return venues;
    } catch (error) {
      throw error;
    }
  }

  public async getVenueById(id: Types.ObjectId): Promise<IVenue> {
    try {
      const venue = await this.venueModel
        .findById(id)
        .populate("createdBy", "email userName");
      if (!venue) {
        throw { status: 404, message: "venueNotFound" };
      }

      return venue;
    } catch (error) {
      throw error;
    }
  }

  public async updateVenue(
    id: Types.ObjectId,
    name?: string,
    location?: string,
    capacity?: number,
    description?: string
  ): Promise<IVenue> {
    try {
      const updateData: Partial<IVenue> = {};
      if (name !== undefined) updateData.name = name;
      if (location !== undefined) updateData.location = location;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (description !== undefined) updateData.description = description;

      const venue = await this.venueModel
        .findByIdAndUpdate(id, updateData, {
          new: true,
        })
        .populate("createdBy", "email userName");
      if (!venue) {
        throw { status: 404, message: "venueNotFound" };
      }

      return venue;
    } catch (error) {
      throw error;
    }
  }

  public async deleteVenue(id: Types.ObjectId): Promise<IVenue> {
    try {
      const venue = await this.venueModel
        .findByIdAndDelete(id)
        .populate("createdBy", "email userName");
      if (!venue) {
        throw { status: 404, message: "venueNotFound" };
      }

      return venue;
    } catch (error) {
      throw error;
    }
  }
}
