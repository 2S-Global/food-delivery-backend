import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";

dotenv.config();
db();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import AuthRouter from "./routes/AuthRoutes.js";

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the Food Delivery App ");
});
app.use("/api/auth", AuthRouter);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});