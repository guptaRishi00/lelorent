import express from "express";
import {
  createProperty,
  getProperties,
} from "../controllers/property.controller.js";
import { requireAuth, clerkClient, getAuth } from "@clerk/express";

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

router.get("/", getProperties);

router.post("/", requireAuth(), requireAdmin, createProperty);

export default router;
