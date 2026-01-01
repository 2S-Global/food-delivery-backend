import ContactUs from "../models/contactUsModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ===============================
// Submit Contact Us Form (Public)
// ===============================
export const submitContactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    // Save to DB
    const contact = await ContactUs.create({
      name,
      email,
      subject,
      message,
    });

    // ===============================
    // Create Email Transporter
    // ===============================
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ===============================
    // Admin Notification Email
    // ===============================
    // const ADMIN_EMAIL = "chandra@2sglobal.us";
    const ADMIN_EMAIL = "souvik.2sglobal@gmail.com";
    const adminMailOptions = {
      from: `"Food Go Support" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: "📩 New Contact Us Message – Food Go",
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f6f8;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .header {
        border-bottom: 2px solid #ff6b00;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .header h2 {
        margin: 0;
        color: #ff6b00;
      }
      .info p {
        margin: 6px 0;
        font-size: 14px;
      }
      .message-box {
        background: #f9f9f9;
        padding: 15px;
        border-left: 4px solid #ff6b00;
        margin-top: 15px;
        font-size: 14px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>New Contact Us Message</h2>
      </div>

      <div class="info">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      </div>

      <div class="message-box">
        <strong>Message:</strong>
        <p>${message}</p>
      </div>

      <div class="footer">
        This message was submitted via the Food Go Contact Us form.
      </div>
    </div>
  </body>
  </html>
  `,
    };

    // ===============================
    // Auto Reply to User
    // ===============================
    const userMailOptions = {
      from: `"Food Go Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We’ve received your message – Food Go",
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f6f8;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #ff6b00;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      .header h2 {
        margin: 0;
        color: #ff6b00;
      }
      .content p {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
      .message-box {
        background: #f9f9f9;
        padding: 15px;
        border-left: 4px solid #ff6b00;
        margin-top: 15px;
        font-size: 14px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Thank You for Contacting Food Go</h2>
      </div>

      <div class="content">
        <p>Dear <strong>${name}</strong>,</p>

        <p>
          Thank you for reaching out to <strong>Food Go</strong>.
          We’ve received your message and our support team will get back to you shortly.
        </p>

        <div class="message-box">
          <strong>Your Message:</strong>
          <p>${message}</p>
        </div>

        <p>
          If your query is urgent, feel free to reply to this email or contact our support team directly.
        </p>

        <p>
          Regards,<br/>
          <strong>Food Go Support Team</strong>
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Food Go. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `,
    };

    // Send Emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("ContactUs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

