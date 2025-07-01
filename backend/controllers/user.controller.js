import express from "express";
import userModel from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";

export const setRoleAndPremium = async (req, res) => {
  const { userId, role, isPremium } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role, isPremium },
    });
    res.json({ success: true, publicMetadata: updatedUser.publicMetadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
