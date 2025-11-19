import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { User } from "../types/types";
import prisma from "../utils/prisma";

export const verifyToken = async (
  token: string,
  secret: string,
  expiresIn: string
) => {
  const decoded = jwt.verify(token, secret);
  return decoded as User;
};

export const generateToken = (user: User) => {
  return jwt.sign(
    user,
    process.env.JWT_SECRET as string as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN as string,
    } as SignOptions
  );
};

export const deleteToken = async (userId: string) => {
  const result = await prisma.token.deleteMany({
    where: { userId },
  });
  return result.count > 0;
};
