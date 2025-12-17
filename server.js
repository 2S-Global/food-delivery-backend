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
import userDataRouter from "./routes/userDataRoutes.js";
import addOrderRouter from "./routes/addOrderRoutes.js";
import userMenuRouter from "./routes/userMenuRoutes.js";

// Testing Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the Food Delivery App ");
});

// Register and Login Routes By Chandra
app.use("/api/auth", AuthRouter);
app.use("/api/userdata", userDataRouter);
app.use("/api/order", addOrderRouter);
app.use("/api/usermenu", userMenuRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});