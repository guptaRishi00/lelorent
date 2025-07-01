import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      firstname: { type: String, default: "" },
      lastname: { type: String, default: "" },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isPremium: { type: Boolean, default: false },
    premiumPurchasedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
