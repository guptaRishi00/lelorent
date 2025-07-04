import dotenv from "dotenv";
dotenv.config(); // MUST be first

import Razorpay from "razorpay";
import crypto from "crypto";
import { clerkClient } from "@clerk/clerk-sdk-node";
import userModel from "../models/user.model.js";

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Mapping plans to amounts in paisa (₹)
const planPricing = {
  monthly: 19900,
  quarterly: 39900,
  yearly: 69900,
};

const planDurations = {
  monthly: 30,
  quarterly: 90,
  yearly: 180,
};

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    
    console.log("Received plan:", plan);
    console.log("Available plans:", Object.keys(planPricing));
    
    const amount = planPricing[plan];

    if (!amount) {
      return res.status(400).json({ 
        message: "Invalid plan", 
        receivedPlan: plan,
        availablePlans: Object.keys(planPricing)
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({ message: "Payment service not configured" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({ 
      success: true, 
      order,
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Verify Payment & Update DB and Clerk
export const verifyPayment = async (req, res) => {
  console.log("🔵 Payment verification endpoint called");
  console.log("🔵 Request body:", req.body);
  console.log("🔵 Auth user ID:", req.auth?.userId);
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update user as premium
    const userId = req.auth.userId;
    console.log("🔑 Payment verified for user:", userId);
    const duration = planDurations[plan] || 30;

    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + duration);

    // Update database - create or update user
    let updatedUser;
    try {
      // Get user data from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Use findOneAndUpdate with upsert to handle both create and update
      updatedUser = await userModel.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          fullname: {
            firstname: clerkUser.firstName ?? "",
            lastname: clerkUser.lastName ?? "",
          },
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber ?? "",
          role: clerkUser.publicMetadata?.role ?? "user",
          isPremium: true,
          premiumPurchasedAt: new Date(),
          premiumExpiresAt,
        },
        { 
          new: true, 
          upsert: true, // Create if doesn't exist, update if exists
          setDefaultsOnInsert: true 
        }
      );
      
      console.log("✅ DB updated/created for user:", userId);
    } catch (dbErr) {
      console.error("❌ DB update error:", dbErr);
      return res.status(500).json({ message: "Failed to update user in DB", error: dbErr.message });
    }

    // Update Clerk metadata
    try {
      // First get current user metadata to preserve existing data
      const clerkUser = await clerkClient.users.getUser(userId);
      const currentMetadata = clerkUser.publicMetadata || {};
      
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          ...currentMetadata, // Preserve existing metadata
          isPremium: true,
          premiumPurchasedAt: new Date().toISOString(),
          premiumExpiresAt: premiumExpiresAt.toISOString(),
          premiumPlan: plan,
          premiumDuration: duration
        }
      });
      console.log("✅ Clerk metadata updated for user:", userId);
    } catch (clerkError) {
      console.error("❌ Error updating Clerk metadata for user:", userId, clerkError);
      // Don't fail the entire request if Clerk update fails
    }

    res.json({ 
      success: true, 
      user: updatedUser,
      message: "Premium subscription activated successfully!"
    });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
};
