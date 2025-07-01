import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("✅ Connected to DB");
  } catch (err) {
    console.error("❌ Error in DB connection:", err.message);
  }
};

export default connectToDb;
