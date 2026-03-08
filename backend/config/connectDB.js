import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

console.log(process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
export default connectDB;
