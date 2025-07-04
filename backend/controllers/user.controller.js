import express from "express";
import userModel from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";

const getExpiryDate = (planType) => {
  const now = new Date();
  if (planType === "monthly") now.setMonth(now.getMonth() + 1);
  else if (planType === "quarterly") now.setMonth(now.getMonth() + 3);
  else if (planType === "yearly") now.setFullYear(now.getFullYear() + 1);
  return now;
};

export const setRoleAndPremium = async (req, res) => {
  const { userId, planType } = req.body;
  const clerkUser = await clerkClient.users.getUser(userId);

  const role = clerkUser.publicMetadata?.role || "user";
  const premiumExpiresAt = getExpiryDate(planType);

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...clerkUser.publicMetadata,
      isPremium: true,
      premiumExpiresAt,
    },
  });

  await userModel.findOneAndUpdate(
    { clerkId: userId },
    {
      role,
      isPremium: true,
      premiumPurchasedAt: new Date(),
      premiumExpiresAt,
      updatedAt: new Date(),
    },
    { new: true }
  );

  res.json({ success: true });
};

export const setDefaultRole = async (req, res) => {
  const { userId } = req.body;
  
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    
    // Only set default role if user doesn't have one
    if (!clerkUser.publicMetadata?.role) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          role: "user",
          isPremium: false, // Ensure new users are not premium by default
        },
      });

      // Also update the database
      await userModel.findOneAndUpdate(
        { clerkId: userId },
        {
          role: "user",
          isPremium: false,
          updatedAt: new Date(),
        },
        { new: true }
      );
    }

    res.json({ success: true, message: "Default role set" });
  } catch (error) {
    console.error("Error setting default role:", error);
    res.status(500).json({ message: "Failed to set default role" });
  }
};

export const syncClerkUser = async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    let user = await userModel.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await userModel.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        fullname: {
          firstname: clerkUser.firstName ?? "",
          lastname: clerkUser.lastName ?? "",
        },
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber ?? "",
        role: clerkUser.publicMetadata?.role ?? "user",
        isPremium: clerkUser.publicMetadata?.isPremium ?? false,
      });
    }

    res.status(200).json({ message: "User synced", user });
  } catch (err) {
    console.error("❌ syncClerkUser error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const clerkWebhookHandler = express
  .Router()
  .post(
    "/clerk",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      let evt;
      try {
        evt = await verifyWebhook(req);
      } catch (err) {
        console.error("Invalid webhook:", err);
        return res.status(400).send("Invalid signature");
      }

      const data = evt.data;
      if (["user.created", "user.updated"].includes(evt.type)) {
        const update = {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          fullname: {
            firstname: data.first_name ?? "",
            lastname: data.last_name ?? "",
          },
          phone: data.phone_numbers?.[0]?.phone_number ?? "",
          role: data.public_metadata?.role ?? "user",
          isPremium: data.public_metadata?.isPremium ?? false,
          updatedAt: new Date(),
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, update, {
          upsert: true,
        });
      }

      res.status(200).send("Webhook processed");
    }
  );
