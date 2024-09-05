import { Inject, Service } from "typedi";
import { Models, Types } from "mongoose";
import jwt from "jsonwebtoken";
import fs from "fs";
import IUser from "../interfaces/IUser";
import bcrypt from "bcryptjs";
import config from "../config";

@Service()
export default class AuthService {
  constructor(@Inject("userModel") private userModel: Models.UserModel) {}

  public async loginUser(
    email: string,
    password: string
  ): Promise<{ user: IUser & { token: string } }> {
    try {
      const user = await this.userModel.findOne({
        email,
      });

      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw { status: 401, message: "wrongPassword" };
      }

      const token = this.generateToken(user);

      return {
        user: {
          ...user.toJSON(),
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  public async registerUser(
    userName: string,
    email: string,
    password: string
  ): Promise<IUser> {
    try {
      const [usernameControl, emailControl] = await Promise.all([
        this.userModel.findOne({
          userName,
        }),
        this.userModel.findOne({
          email,
        }),
      ]);

      if (usernameControl) {
        throw { status: 409, message: "userNameAlreadyExists" };
      }

      if (emailControl) {
        throw { status: 409, message: "emailAlreadyExists" };
      }

      const hashedPass = await bcrypt.hash(
        password,
        Number(config.password_salt)
      );

      const user = await this.userModel.create({
        userName,
        email,
        password: hashedPass,
      });

      return user.toJSON();
    } catch (e) {
      throw e;
    }
  }

  public async updateRole(
    userId: Types.ObjectId,
    password: string
  ): Promise<{ user: IUser & { token: string } }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw { status: 404, message: "userNotFound" };
      }

      const isPasswordValid = password === config.admin_password;
      if (!isPasswordValid) {
        throw { status: 401, message: "wrongPassword" };
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        { _id: userId },
        {
          role: user.role === "user" ? "admin" : "user",
        },
        { new: true }
      );

      const token = this.generateToken(updatedUser);

      return {
        user: {
          ...user.toJSON(),
          token,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  private generateToken(user: IUser) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 300);

    const privateKey = fs.readFileSync("keys/private_key.pem", "utf8");

    return jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        role: user.role,
        exp: exp.getTime() / 1000,
      },
      privateKey,
      {
        algorithm: "RS256",
      }
    );
  }
}
