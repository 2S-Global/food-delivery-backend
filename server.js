import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";

dotenv.config();
db();

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: [
      "https://food-delivery-frontend-ten-theta.vercel.app",
      "http://localhost:3000",
      "https://food-go-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import AuthRouter from "./routes/AuthRoutes.js";
import userDataRouter from "./routes/userDataRoutes.js";
import addOrderRouter from "./routes/addOrderRoutes.js";
import userMenuRouter from "./routes/userMenuRoutes.js";
import userBlogRouter from "./routes/userBlogRoutes.js";
import userCartRouter from "./routes/userCartRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import userVerificationRoutes from "./routes/userVerificationRoutes.js";
import userOrderRouter from "./routes/userOrderRoutes.js";
import surveyRoutes from "./routes/survey.routes.js";
import weeklymenuRoutes from "./routes/weeklymenuRoutes.js";
import contactUsRoutes from "./routes/contactUsRoutes.js";
// Testing Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the Food Delivery App ");
});

// Register and Login Routes By Chandra
app.use("/api/auth", AuthRouter);
app.use("/api/userdata", userDataRouter);
app.use("/api/order", addOrderRouter);
app.use("/api/usermenu", userMenuRouter);
app.use("/api/userblog", userBlogRouter);
app.use("/api/usercart", userCartRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/verify", userVerificationRoutes);
app.use("/api/user-order", userOrderRouter);
app.use("/api/survey", surveyRoutes);
app.use("/api/weeklymenu", weeklymenuRoutes);
app.use("/api/contact-us", contactUsRoutes);
const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);

// });

export default app;