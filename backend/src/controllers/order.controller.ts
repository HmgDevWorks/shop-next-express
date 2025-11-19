import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { Order, OrderStatus, Product } from "@prisma/client";
import { ApiResponse } from "../types/types";

export const createOrder = async (
  userId: string,
  products: Product[],
  totalAmount: number,
  status: OrderStatus = OrderStatus.PENDING
): Promise<ApiResponse<Order>> => {
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status,
      products: {
        create: products.map((product) => ({
          productId: product.id,
          quantity: 1,
          price: product.price,
        })),
      },
    },
  });
  return {
    success: true,
    data: order,
  };
};

export const updateOrder = async (
  id: string,
  status: OrderStatus
): Promise<ApiResponse<Order | null>> => {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return {
    success: true,
    data: order as Order | null,
  };
};

export const deleteOrder = async (
  id: string
): Promise<ApiResponse<Order | null>> => {
  const order = await prisma.order.delete({
    where: { id },
  });
  return {
    success: true,
    data: order as Order | null,
  };
};

export const getOrderById = async (
  id: string
): Promise<ApiResponse<Order | null>> => {
  const order = await prisma.order.findUnique({
    where: { id },
  });
  return {
    success: true,
    data: order as Order | null,
  };
};

export const getOrders = async (): Promise<ApiResponse<Order[]>> => {
  const orders = await prisma.order.findMany();
  return {
    success: true,
    data: orders as Order[],
  };
};

export const getCurrentOrderByUserId = async (
  userId: string
): Promise<ApiResponse<Order | null>> => {
  const order = await prisma.order.findFirst({
    where: { userId, status: OrderStatus.PENDING },
  });
  return {
    success: true,
    data: order as Order | null,
  };
};

export const getOrdersByUserId = async (
  userId: string
): Promise<ApiResponse<Order[]>> => {
  const orders = await prisma.order.findMany({
    where: { userId },
  });
  return {
    success: true,
    data: orders as Order[],
  };
};
