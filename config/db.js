import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();

const MONGODB_URI = process.env.MONGO_URL;

const db = async () => {
  try {
    mongoose.set("strictQuery", true);
    const con = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 50, // default is 10
    });
    console.log(
      `MongoDB connection established: ${con.connection.host}`.green.bold
    );
  } catch (error) {
    console.error(colors.red(`Error connecting to MongoDB: ${error.message}`));
    process.exit(1); // Exit process with failure
  }
};

export default db;