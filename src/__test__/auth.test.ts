import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import AuthService from "../services/auth";
import IUser from "../interfaces/IUser";
import config from "../config";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("fs");

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserModel: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    authService = new AuthService(mockUserModel);
  });

  describe("loginUser", () => {
    it("should login a user successfully and return the user with token", async () => {
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "testUser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
      };

      mockUserModel.findOne.mockResolvedValue({
        ...mockUser,
        toJSON: jest.fn().mockReturnValue(mockUser),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      const result = await authService.loginUser(
        "test@example.com",
        "testPassword"
      );

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "testPassword",
        mockUser.password
      );
      expect(result.user.token).toBe("fakeToken");
    });

    it("should throw an error if user not found", async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.loginUser("test@example.com", "testPassword")
      ).rejects.toEqual({ status: 404, message: "userNotFound" });
    });

    it("should throw an error if password is invalid", async () => {
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "testUser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginUser("test@example.com", "testPassword")
      ).rejects.toEqual({ status: 401, message: "wrongPassword" });
    });
  });

  describe("registerUser", () => {
    it("should register a user successfully", async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "newUser",
        email: "new@example.com",
        password: "hashedPassword",
        role: "user",
      };
      mockUserModel.create.mockResolvedValue({
        toJSON: jest.fn().mockReturnValue(mockUser),
      });

      const result = await authService.registerUser(
        "newUser",
        "new@example.com",
        "testPassword"
      );

      expect(mockUserModel.create).toHaveBeenCalledWith({
        userName: "newUser",
        email: "new@example.com",
        password: "hashedPassword",
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw an error if username already exists", async () => {
      mockUserModel.findOne.mockResolvedValueOnce({});

      await expect(
        authService.registerUser("existingUser", "new@example.com", "password")
      ).rejects.toEqual({ status: 409, message: "userNameAlreadyExists" });
    });

    it("should throw an error if email already exists", async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockResolvedValueOnce({});

      await expect(
        authService.registerUser("newUser", "existing@example.com", "password")
      ).rejects.toEqual({ status: 409, message: "emailAlreadyExists" });
    });
  });

  describe("updateRole", () => {
    it("should update user role and return updated user with token", async () => {
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "testUser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
      };
      mockUserModel.findById.mockResolvedValue({
        ...mockUser,
        toJSON: jest.fn().mockReturnValue(mockUser),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockUserModel.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        role: "admin",
        toJSON: jest.fn().mockReturnValue({ ...mockUser, role: "admin" }),
      });
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      const result = await authService.updateRole(
        mockUser._id,
        config.admin_password
      );

      expect(result.user.token).toBe("fakeToken");
    });

    it("should throw an error if user not found", async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        authService.updateRole(new Types.ObjectId(), config.admin_password)
      ).rejects.toEqual({ status: 404, message: "userNotFound" });
    });

    it("should throw an error if password is wrong", async () => {
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "testUser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
      };
      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(
        authService.updateRole(mockUser._id, "wrongPassword")
      ).rejects.toEqual({ status: 401, message: "wrongPassword" });
    });
  });

  describe("generateToken", () => {
    it("should generate a JWT token", () => {
      const mockUser: IUser = {
        _id: new Types.ObjectId(),
        userName: "testUser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
      };

      (fs.readFileSync as jest.Mock).mockReturnValue("privateKey");
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      const token = authService["generateToken"](mockUser);
      expect(token).toBe("fakeToken");
    });
  });
});
