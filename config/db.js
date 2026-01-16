import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
  throw new Error("MONGO_URL not defined");
}

// Global cache (critical for Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const db = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10, // IMPORTANT for Atlas free tier
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected`.green.bold);
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection failed:", error.message);
    throw error; // ❗ DO NOT exit process
  }

  return cached.conn;
};

export default db;
