import bcrypt from "bcrypt";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const getTest = async (req, res) => {
  try {

    res.json({ success: true, data: "Food Delivery First API is Running Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  try {

    console.log("REQUEST BODY:", req.body);  // <-- Debug


    // dotenv.config();
    const { name, email, password, phone_number } = req.body;
    const role = 0;
    const user_type = "admin";
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Formatting Phone Number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Store in DB (E.164 format)
    const dbPhoneNumber = phoneNumber.number;

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      user_type,
      phone_number: dbPhoneNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Customer Register
export const registerCustomer = async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);  // <-- Debug

    // dotenv.config();
    const { name, email, password, phone_number } = req.body;
    const role = 1;
    const user_type = "customer";
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Formatting Phone Number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Store in DB (E.164 format)
    const dbPhoneNumber = phoneNumber.number;

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      user_type,
      phone_number: dbPhoneNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });


    // Email Verification mail starts from here

    const transporterEmailVerification = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const encodedToken = encodeURIComponent(token);

    const mailOptionsEmailVerification = {
      from: `"Food Go Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Access Credentials for Food Go",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Food Go</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform, <a href="https://food-go-frontend.vercel.app" target="_blank">https://food-go-frontend.vercel.app</a>, <strong>Food Go</strong>, a hostel-focused meal delivery and subscription management platform designed to simplify daily food services. The system offers structured meal subscriptions for both <strong>vegetarian</strong> and <strong>non-vegetarian</strong> menus.
          <br /><br />
          Users can choose a subscription with a <strong>minimum duration of one week</strong>, with the flexibility to extend the plan for <strong>2, 3, 4, 5 weeks or more</strong> based on their requirements. Each active subscription includes <strong>two meals per day</strong>—<strong>lunch and dinner</strong>—ensuring consistent and timely meal delivery.
          <br /><br />
          In addition to the standard meals, the platform also provides <strong>optional add-on items</strong> such as salads, milk, and soft drinks, allowing users to customize their daily food intake. Food Go streamlines subscription management, meal selection, and add-on purchases, making it an efficient and user-friendly solution for hostel meal services.
        </p>

  
        <p>Your corporate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>

       <p>Click the link  to verify your email: <a href="${process.env.CLIENT_BASE_URL}/api/auth/verify-email?token=${encodedToken}">Verify Email</a></p>
      
        <p><strong>Key Features and Benefits of Food Go:</strong></p>
        <ul>
          <li>Meal Subscription Management: Users can subscribe to structured meal plans with a minimum duration of one week.</li>
          <li>Veg & Non-Veg Menu Options: Separate vegetarian and non-vegetarian menus are available based on user preference.</li>
          <li>Flexible Subscription Duration: Users can extend subscriptions for multiple weeks (2, 3, 4, 5 weeks or more).</li>
          <li>Daily Meal Delivery: Each active subscription includes two meals per day — lunch and dinner.</li>
          <li>Additional Items Selection: Optional add-on items such as salads, milk, and soft drinks can be selected along with meals.</li>
          <li>Easy Management: Users can manage subscriptions, view meal details, and track delivery status through the platform.</li>
          <li>Secure Platform: User data and subscription details are securely managed with proper data protection.</li>
        </ul>
      
        <p>
          We are confident that <strong>Food Go</strong> will simplify hostel meal management by offering a reliable, flexible, and user-friendly subscription-based food delivery experience for both users and service providers.
        </p>
      
        <p>
          For any assistance with the platform, including login issues or technical support, please contact our support team at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for choosing <strong>Food Go</strong>.</p>
        <p>We look forward to supporting your daily meal needs through a reliable and flexible subscription-based food delivery experience.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Food GO</strong></p>

         <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporterEmailVerification.sendMail(mailOptionsEmailVerification);



    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Update Delivery Boy Account
export const updateDeliveryBoyAccount = async (req, res) => {
  try {
    const { userId } = req.query;
    const { name, email, phone_number } = req.body;

    // Validate required fields
    if (!name || !email || !phone_number) {
      return res
        .status(400)
        .json({ message: "name, email, and phone_number are required" });
    }

    // Check if the email is taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
      is_del: false,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another account",
      });
    }

    // Validate phone number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const formattedPhone = phoneNumber.number; // E.164 Format

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phone_number: formattedPhone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Register Delivery Boy
export const registerDeliveryBoy = async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
    } = req.body;
    const role = 2;
    const user_type = "delivery_boy";
    const self_registered = 0;
    // Validate required fields
    if (!name || !email || !phone_number) {
      return res.status(400).json({ message: "Name, email, pone number" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
      is_del: false,
      is_active: true,
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a new arbitrary password (e.g. 8 characters)
    const generatePassword = () => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#";
      let password = "";
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generatePassword();

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      phone_number,
      password: hashedPassword,
      role,
      user_type,
      self_registered,
    });
    await newUser.save();
    /* const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    }); */

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // fixed typo
      port: process.env.EMAIL_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Food Go Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "Access Credentials for Food Go - Delivery Partner Account Activated",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>FOOD GO</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched <strong>Food Go Delivery Partner Platform</strong>,
          <a href="https://www.quikchek.in" target="_blank">https://www.quikchek.in</a>,
          designed to help delivery partners manage orders efficiently, complete deliveries faster, and track earnings smoothly. This platform ensures accuracy, speed, and a seamless delivery experience.
        </p>

        <p>Your delivery partner account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${newPassword}</li>
        </ul>
      
       <p>Click the link  to verify your email: <a href="${process.env.CLIENT_BASE_URL}/api/auth/verify-email?token=${token}">Verify Email</a></p>
      
        <p><strong>Key Features and Benefits for Food Go Delivery Partners:</strong></p>
        <ul>
          <li>Instant Order Assignment: Receive delivery requests directly on your app with clear pickup and drop details.</li>
          <li>Live Navigation: Integrated maps for accurate and quick route guidance.</li>
          <li>Efficient Workflow: Streamlined process from accepting orders to completing the delivery.</li>
          <li>Secure Platform: Built with advanced security to protect your profile and delivery information.</li>
          <li>Earnings Dashboard: Track your daily, weekly, and monthly earnings with complete transparency.</li>
          <li>Delivery History: Access all your completed delivery records anytime.</li>
          <li>Support Assistance: Our dedicated support team is always available to assist with delivery or technical issues.</li>
        </ul>
      
        <p>
         We are confident that Food Go will greatly simplify your delivery process and help improve your overall performance and earnings.
        </p>
      
        <p>
          For any assistance with the platform, including login issues or technical support, please contact our support team at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for joining <strong>Food Go</strong> as a valued Delivery Partner..</p>
        <p>We look forward to supporting your growth and success.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

         <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered Successfully!",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      email,
      is_active: true,
      is_del: false,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials or account not active.",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Your Email is not Verified.Please Verify it first.",
        success: false,
      });
    }

    // If password is hashed, compare using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Build payload
    // let payload = { userId: user._id };

    // If employer role, add companyId
    // if (user.role === 2 && user.company_id) {
    //   payload.companyId = user.company_id;
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, companyId: user.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: user,
      role: user.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

// List Customers
export const listCustomers = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const candidates = await User.find({
      role: 1,
      is_del: false,
      user_type: "customer",
    }).select("name email phone_number is_active createdAt");

    // If no data found
    if (!candidates.length) {
      return res.status(404).json({
        success: false,
        message: "No candidates found"
      });
    }

    // Format date + time to: 22/05/2025, 01:58 PM
    const formattedCandidates = candidates.map((item) => {
      const formattedDate = item.createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        ...item._doc,
        createdAt: formattedDate,
      };
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: formattedCandidates
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message
    });
  }
};

// Valid token
export const validtoken = async (req, res) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
        isvalid: false,
      });
    }
    return res.status(200).json({
      message: "Token is valid.",
      success: true,
      isvalid: true,
    });
  } catch (error) {
    console.error("Error while validating token:", error);
    return res.status(500).json({
      message: "An error occurred while validating the token.",
      success: false,
      isvalid: false,
    });
  }
};

// Verify-email
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("This is Token", token);

  const generateHTML = (title, heading, message, color) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f4f9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          max-width: 500px;
          width: 90%;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: ${color};
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          font-size: 16px;
          color: #333;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
          }
          h1 {
            font-size: 20px;
          }
          p {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
       
        <h1>${heading}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send(
          generateHTML(
            "Verification Failed",
            "User Not Found",
            "The user associated with this token does not exist.",
            "red"
          )
        );
    }

    if (user.isVerified) {
      return res
        .status(200)
        .send(
          generateHTML(
            "Email Already Verified",
            "You're Already Verified!",
            "Your email address has already been verified. You can log in now.",
            "green"
          )
        );
    }

    user.isVerified = true;
    await user.save();

    return res
      .status(200)
      .send(
        generateHTML(
          "Email Verified",
          "Success!",
          "Your email has been verified successfully. You can now access all features.",
          "#28a745"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send(
        generateHTML(
          "Invalid or Expired Token",
          "Verification Failed",
          "The verification link is invalid or has expired. Please try again or contact support.",
          "red"
        )
      );
  }
};
