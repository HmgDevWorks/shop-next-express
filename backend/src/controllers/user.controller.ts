import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { ApiResponse, User } from "../types/types";

export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const users = await prisma.user.findMany();
  return {
    success: true,
    data: users as User[],
  };
};

export const getUserById = async (
  id: string
): Promise<ApiResponse<User | null>> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return {
    success: true,
    data: user as User | null,
  };
};

export const getUserByEmail = async (
  email: string
): Promise<ApiResponse<User | null>> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return {
      success: false,
      data: null,
      message: "User not found",
      errors: ["User not found"],
    };
  }
  return {
    success: true,
    data: user as User,
    message: "User found successfully",
    errors: [],
  };
};

export const createUser = async (
  email: string,
  name: string,
  password: string
): Promise<ApiResponse<User>> => {
  const user = await prisma.user.create({
    data: { email, name, password },
  });
  return {
    success: true,
    data: user as User,
    message: "User created successfully",
    errors: [],
  };
};

export const updateUser = async (
  id: string,
  email: string,
  name: string,
  password: string
): Promise<ApiResponse<User | null>> => {
  const user = await prisma.user.update({
    where: { id },
    data: { email, name, password },
  });
  return {
    success: true,
    data: user as User | null,
    message: "User updated successfully",
    errors: [],
  };
};

export const deleteUser = async (
  id: string
): Promise<ApiResponse<User | null>> => {
  const user = await prisma.user.delete({
    where: { id },
  });
  return {
    success: true,
    data: user as User | null,
    message: "User deleted successfully",
    errors: [],
  };
};
