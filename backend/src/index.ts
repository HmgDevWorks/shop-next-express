import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createUser, getUserByEmail } from "./controllers/user.controller";
import {
  verifyToken,
  generateToken,
  deleteToken,
} from "./middleware/jwt.middleware";
import {
  createOrder,
  getOrdersByUserId,
  updateOrder,
  getCurrentOrderByUserId,
  deleteOrder,
} from "./controllers/order.controller";
import { Token, User, Product } from "@prisma/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

const authMiddleware = async (req: Request): Promise<User | null> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return null;
    }
    return await verifyToken(
      token as string,
      process.env.JWT_SECRET as string,
      process.env.JWT_EXPIRES_IN as string
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ message: "Backend is running!" });
});

app.get("login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user.success) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!user.data?.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  bcrypt.compare(password, user.data.password, (err, result) => {
    if (err) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!result) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user.data as User);
    res.json({ success: true, data: { token } });
  });
});

app.get("register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await createUser(email, name, password);
  if (!user.success) {
    return res.status(401).json({ message: "User not created" });
  }
  const token = generateToken(user.data as User);
  res.json({
    success: true,
    data: { token },
    message: "User created successfully",
  });
});

app.get("logout", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  await deleteToken(user.id);
  res.json({ success: true, message: "Logged out successfully" });
});

app.get(
  "getCurrentOrderByUserId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as Request & { user: User }).user;
    const order = await getCurrentOrderByUserId(user.id);
    if (!order.success) {
      return res.status(401).json({ message: "Order not found" });
    }
    res.json({
      success: true,
      data: { order },
      message: "Order found successfully",
    });
  }
);

app.get(
  "getUserOrders",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as Request & { user: User }).user;
    const orders = await getOrdersByUserId(user.id);
    if (!orders.success) {
      return res.status(401).json({ message: "Orders not found" });
    }
    res.json({
      success: true,
      data: { orders },
      message: "Orders found successfully",
    });
  }
);

app.get("createOrder", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { products, totalAmount, status } = req.body;
  const order = await createOrder(
    user.id,
    products as Product[],
    totalAmount,
    status
  );
  if (!order.success) {
    return res.status(401).json({ message: "Order not created" });
  }
  res.json({
    success: true,
    data: { order },
    message: "Order created successfully",
  });
});

app.get("updateOrder", authMiddleware, async (req: Request, res: Response) => {
  const { orderId, status } = req.body;
  const order = await updateOrder(orderId, status);
  if (!order.success) {
    return res.status(401).json({ message: "Order not updated" });
  }
  res.json({
    success: true,
    data: { order },
    message: "Order updated successfully",
  });
});

app.get("deleteOrder", authMiddleware, async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const order = await deleteOrder(orderId);
  if (!order.success) {
    return res.status(401).json({ message: "Order not deleted" });
  }
  res.json({
    success: true,
    data: { order },
    message: "Order deleted successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
