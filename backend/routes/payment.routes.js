import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

// Authenticated routes
router.post("/create-order", ClerkExpressRequireAuth(), createOrder);
router.post("/verify", ClerkExpressRequireAuth(), verifyPayment);

export default router;
