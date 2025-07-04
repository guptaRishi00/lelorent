import express from "express";
import {
  syncClerkUser,
  setRoleAndPremium,
  setDefaultRole,
} from "../controllers/user.controller.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";

const router = express.Router();

router.use(clerkMiddleware());

router.post("/sync", requireAuth(), syncClerkUser);

router.post(
  "/set-role-premium",
  requireAuth(),

  setRoleAndPremium
);

router.post(
  "/set-default-role",
  requireAuth(),
  setDefaultRole
);

export default router;
