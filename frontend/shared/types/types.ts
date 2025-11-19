interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

enum Category {
  ELECTRONICS = "ELECTRONICS",
  CLOTHING = "CLOTHING",
  HOME = "HOME",
  BEAUTY = "BEAUTY",
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Cart {
  id: string;
  userId: string;
  products: Product[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

enum OrderStatus {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  REFUNDED = "REFUNDED",
  RETURNED = "RETURNED",
}

export type {
  User,
  Product,
  ApiResponse,
  Category,
  Order,
  OrderItem,
  Cart,
  Review,
  OrderStatus,
};
