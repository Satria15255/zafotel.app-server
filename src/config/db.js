import mongoose from "mongoose";
import { startAutoExpireJob } from "../utils/autoExpireBooking.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    startAutoExpireJob();
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
