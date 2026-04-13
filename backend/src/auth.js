import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { sendOTPEmail } from "./controller/sendotp.js";
import { v4 as uuidv4 } from "uuid";
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-client";
import { loadEnv } from "./env.js";
import { upsertStreamUser } from "./lib/stream.js";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createRealtimeEvent, emitRealtimeEvent } from "./websocket.js";

// Load environment variables
loadEnv();

// GetStream configuration
const GETSTREAM_API_KEY = process.env.GETSTREAM_API_KEY || "-1417325";
const GETSTREAM_API_SECRET = process.env.GETSTREAM_API_SECRET || "bmsndsx5dq22fnw64bvnv54cw8kqfnhhjzdgwdh5nhye2g4gyqd8w8jfd5ttpm9x";

// Initialize Stream Chat client
const streamClient = StreamChat.getInstance(GETSTREAM_API_KEY, GETSTREAM_API_SECRET);

// Initialize Stream Video client (server-side)
let streamVideoClient;
try {
  streamVideoClient = new StreamVideoClient(GETSTREAM_API_KEY, GETSTREAM_API_SECRET);
} catch (err) {
  console.log("Stream Video client initialization:", err.message);
}

// main
const router=express.Router();
const databaseUrl = process.env.DATABASE_URL;
const DEFAULT_ADMIN_EMAIL = "skincare.by.aarzoo@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "SkinCare@Aarzoo";
const DEFAULT_ADMIN_FULLNAME = "SkinCare By Aarzoo";
const RAZORPAY_CURRENCY = "INR";
const SESSION_PRICING_INR = Object.freeze({
  consultation: 1499,
  technical: 1999,
  followup: 999,
  demo: 2499,
});
const SESSION_TYPE_LABELS = Object.freeze({
  consultation: "General Consultation",
  technical: "Technical Support",
  followup: "Follow-up Session",
  demo: "Product Demo",
});
const VALID_SESSION_TYPES = new Set(Object.keys(SESSION_PRICING_INR));
const BASE_DURATION_MINUTES = 30;
const EXTRA_15_MIN_PRICE_INR = 349;
const MIN_BOOKING_MINUTES = 15;
const MAX_BOOKING_MINUTES = 120;

// connect to database
const db = new pg.Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

const getUserByEmail = async (email) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
};

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function getBookingAmountInInr(sessionType, duration) {
  const baseAmount = SESSION_PRICING_INR[sessionType] || SESSION_PRICING_INR.consultation;
  const extraBlocks = Math.max(0, Math.ceil((duration - BASE_DURATION_MINUTES) / 15));
  return baseAmount + extraBlocks * EXTRA_15_MIN_PRICE_INR;
}

function parseBookingPayload(payload = {}) {
  const sessionType = String(payload.sessionType || "").trim().toLowerCase();
  if (!VALID_SESSION_TYPES.has(sessionType)) {
    return { error: "Invalid session type selected" };
  }

  const duration = Number(payload.duration);
  if (
    !Number.isInteger(duration) ||
    duration < MIN_BOOKING_MINUTES ||
    duration > MAX_BOOKING_MINUTES ||
    duration % 15 !== 0
  ) {
    return { error: "Duration must be between 15 and 120 minutes in 15-minute steps" };
  }

  const scheduledDate = new Date(payload.scheduledTime);
  if (Number.isNaN(scheduledDate.getTime())) {
    return { error: "Invalid scheduled date/time" };
  }

  if (scheduledDate.getTime() < Date.now() + 60 * 1000) {
    return { error: "Please choose a future time for the booking" };
  }

  return {
    sessionType,
    duration,
    scheduledDate,
    amountInInr: getBookingAmountInInr(sessionType, duration),
    sessionLabel: SESSION_TYPE_LABELS[sessionType] || sessionType,
  };
}

function verifyRazorpayPaymentSignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

async function initializeDatabase() {
  await db.connect();
  console.log("Connected to database");

  await db.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          fullname VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          profilepic TEXT,
          role VARCHAR(20) DEFAULT 'user',
          stream_token TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `);

  await db.query(`
      CREATE TABLE IF NOT EXISTS video_call_bookings (
          id SERIAL PRIMARY KEY,
          booking_id VARCHAR(50) UNIQUE NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          session_type VARCHAR(50) NOT NULL,
          scheduled_time TIMESTAMP NOT NULL,
          duration INTEGER DEFAULT 30,
          status VARCHAR(20) DEFAULT 'pending',
          stream_session_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `);

  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stream_token TEXT`);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(255)`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255)`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS payment_signature TEXT`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS amount_paid INTEGER`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR'`);
  await db.query(`ALTER TABLE video_call_bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'`);
  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_video_call_bookings_payment_order_id_unique
     ON video_call_bookings (payment_order_id) WHERE payment_order_id IS NOT NULL`
  );
  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_video_call_bookings_payment_id_unique
     ON video_call_bookings (payment_id) WHERE payment_id IS NOT NULL`
  );

  const adminPasswordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await db.query(
    `INSERT INTO users (fullname, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET fullname = EXCLUDED.fullname,
         password = EXCLUDED.password,
         role = 'admin'`,
    [DEFAULT_ADMIN_FULLNAME, DEFAULT_ADMIN_EMAIL, adminPasswordHash]
  );

  console.log("Database tables initialized");
  console.log(`Admin user ensured for ${DEFAULT_ADMIN_EMAIL}`);
}

// Connect to database and initialize tables
if (databaseUrl) {
  initializeDatabase().catch((err) => {
    console.log("Database connection error:", err.message);
  });
} else {
  console.error("DATABASE_URL is missing; auth routes will not work until it is configured.");
}

// code for authentication routes will go here
// local strategy
passport.use(new LocalStrategy(async function verify(username,password,cb){
    try{
        // Ensure database is connected
        if (db._ending) {
            await db.connect();
        }
        const res=await db.query("SELECT * FROM users WHERE email=$1",[username]);
        if(res.rows.length===0){
            return cb(null,false,{message:"User not found"});
        }
        const user=res.rows[0];
        const match=await bcrypt.compare(password,user.password);
        if(match){
            return cb(null,user);
        }else{
            return cb(null,false,{message:"Incorrect password"});
        }
    }catch(err){
        return cb(err);
    }
}))
passport.serializeUser(function(user,cb){
    cb(null,user.email);
});

passport.deserializeUser(async function(email,cb){
    try{
        const res=await db.query("SELECT * FROM users WHERE email=$1",[email]); 
        if(res.rows.length===0){
            return cb(null,false);
        }
        const user=res.rows[0];
        return cb(null,user);
    }catch(err){
        return cb(err);
    }
});
// login route
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    // Log the message from the strategy callback
    if (info && info.message) {
      return res.status(401).json({ message: info.message, validate: false });
    }

    if (err) {
      console.error('Authentication Error:', err);
      return res.status(500).json({ message: 'Authentication error.', validate: false });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed.', validate: false });
    }

    // If authentication is successful, log the user in and establish session
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      console.log('User authenticated:', user.username);
      return res.status(200).json({ message: 'Logged in successfully!', validate: true });
    });
  })(req, res, next);  // <== Don't forget this part!
});

// logout route
router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.json({ message: "Logged out successfully", validate: true });
    });
});

// check if user is authenticated
router.get('/check-auth', function(req, res) {
    if (req.isAuthenticated()) {
        res.send({ authenticated: true });
    } else {
        res.send({ authenticated: false });
    }
});

// registration route
router.post("/register", async (req, res) => {
  const { fullname, email, password} = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.send({ validate: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.send({ validate: false, message: "Password must be at least 6 characters" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.send({ validate: false, message: "Invalid email format" });
    }

    let userCheck = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userCheck.rows.length > 0) {
      return res.send({ validate: false, message: "User already exists" });
    }

    // Wait for hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Add expiry time => 2 minutes
    const otpExpiry = Date.now() + 2 * 60 * 1000;

    // Save in session
    req.session.data = {
      fullname,
      email,
      passwordHash: hashedPassword,
      otp,
      otpExpiry
    };

    const mailResult = await sendOTPEmail(email, otp);

    if (mailResult.messageId) {
      return res.send({
        message: "OTP sent to email. Please verify to complete registration.",
        validate: true,
      });
    }

    console.error("Failed to send OTP email during registration:", mailResult.error);
    return res.status(502).send({
      message: "Unable to send OTP email right now. Please try again.",
      validate: false,
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({ validate: false, message: "Server error during registration" });
  }
});

// otp verification route
router.post("/otp", async (req, res, next) => {
  const { otp } = req.body;

  if (!req.session.data) {
    return res.status(400).send({ validate: false, message: "No registration in progress" });
  }

  const { email, passwordHash, fullname, otp: sessionOtp, otpExpiry } = req.session.data;

  // Check expiry
  if (Date.now() > otpExpiry) {
    req.session.data = null;
    return res.status(410).send({ validate: false, message: "OTP has expired. Please register again." });
  }

  if (parseInt(otp) !== sessionOtp) {
    return res.status(401).send({ validate: false, message: "Invalid OTP" });
  }

  try {
    await db.query("INSERT INTO users (fullname, email, password, profilepic) VALUES ($1, $2, $3, $4)", [
      fullname,
      email,
      passwordHash,
      'default.png'
    ]);

    // Create Stream user for chat
    const streamUserId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    try {
      await upsertStreamUser({
        id: streamUserId,
        name: fullname,
        image: "",
      });
      console.log(`Stream user created for ${fullname}`);
    } catch (streamError) {
      console.log("Error creating Stream user:", streamError.message);
    }

    const newUser = { email:email, passpword:passwordHash, fullname:fullname };
    
    // Use passport to login
    req.logIn(newUser, (err) => {
      if (err) {
        console.log("Login error:", err);
        return res.status(500).send({ validate: false, message: "Login failed" });
      }

      console.log("User registered & logged in:", newUser);
      req.session.data = null;  // Clear temporary session

      return res.status(201).send({
        validate: true,
        message: "Registration successful & user logged in",
        user: newUser
      });
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({ validate: false, message: "Error during registration" });
  }
});
// resend otp route 
router.post("/resend-otp", async (req, res) => {
  if (!req.session.data) {
    return res.status(400).send({ validate: false, message: "No registration in progress" });
  }
  const { email } = req.session.data;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = Date.now() + 2 * 60 * 1000;
  req.session.data.otp = otp;
  req.session.data.otpExpiry = otpExpiry;

  const mailResult = await sendOTPEmail(email, otp);

  if (mailResult.messageId) {
    return res.send({
      message: "OTP resent successfully.",
      validate: true
    });
  }

  console.error("Failed to resend OTP email:", mailResult.error);
  return res.status(502).send({
    message: "Unable to resend OTP right now. Please try again.",
    validate: false,
  });
});
// update profile route
const checkauth = (req, res, next) => {
  if (req.isAuthenticated()) { 
      
       return next();
  } else {
    return res.send({validate:false, message: "User not logged in" });
   }

}
router.post("/update-profile",checkauth, async (req, res) => {
  const { fullname} = req.body;
  const email = req.user.email;
  try {
    const result = await db.query(
      "UPDATE users SET fullname = $1, profilepic = $2 WHERE email = $3 RETURNING *",
      [fullname,  email]
    );
    res.send({ validate: true, message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error updating profile" });
  }
});
// user
router.get("/user", checkauth, async (req, res) => {
  try {
    
    const user = req.user;
    res.send({ validate: true, user:user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error fetching user data" });
  }
});

// Get Stream Chat token for video calls
router.get("/video-call/token", checkauth, async (req, res) => {
  try {
    const user = req.user;
    
    // Create or get Stream Chat user
    const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Generate Stream Chat token
    const token = streamClient.createToken(streamUserId, Math.floor(Date.now() / 1000) + 3600); // 1 hour expiry
    
    res.send({ 
      validate: true, 
      token: token,
      apiKey: GETSTREAM_API_KEY,
      userId: streamUserId
    });
  } catch (err) {
    console.error('Stream token error:', err);
    res.status(500).send({ validate: false, message: "Error generating video call token" });
  }
});

// GetStream Video Call Routes

// Create Razorpay order for video-call booking payment
router.post("/video-call/payment/create-order", checkauth, async (req, res) => {
  try {
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      return res.status(500).send({
        validate: false,
        message: "Razorpay is not configured on the server",
      });
    }

    const bookingDetails = parseBookingPayload(req.body);
    if (bookingDetails.error) {
      return res.status(400).send({ validate: false, message: bookingDetails.error });
    }

    const order = await razorpayClient.orders.create({
      amount: bookingDetails.amountInInr * 100,
      currency: RAZORPAY_CURRENCY,
      receipt: `vc_${Date.now()}_${uuidv4().slice(0, 8)}`,
      notes: {
        userEmail: req.user.email,
        sessionType: bookingDetails.sessionType,
        duration: String(bookingDetails.duration),
        scheduledTime: bookingDetails.scheduledDate.toISOString(),
      },
    });

    return res.send({
      validate: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingPreview: {
        sessionType: bookingDetails.sessionType,
        sessionLabel: bookingDetails.sessionLabel,
        scheduledTime: bookingDetails.scheduledDate.toISOString(),
        duration: bookingDetails.duration,
        amountInInr: bookingDetails.amountInInr,
      },
    });
  } catch (err) {
    console.error("Create payment order error:", err);
    return res.status(500).send({
      validate: false,
      message: "Unable to create payment order",
    });
  }
});

// Verify Razorpay payment and confirm booking
router.post("/video-call/payment/verify-and-book", checkauth, async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      bookingData,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).send({
        validate: false,
        message: "Missing Razorpay payment details",
      });
    }

    const bookingDetails = parseBookingPayload(bookingData);
    if (bookingDetails.error) {
      return res.status(400).send({ validate: false, message: bookingDetails.error });
    }

    const razorpayClient = getRazorpayClient();
    if (!razorpayClient) {
      return res.status(500).send({
        validate: false,
        message: "Razorpay is not configured on the server",
      });
    }

    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isSignatureValid) {
      return res.status(400).send({
        validate: false,
        message: "Invalid payment signature",
      });
    }

    const [order, payment] = await Promise.all([
      razorpayClient.orders.fetch(razorpayOrderId),
      razorpayClient.payments.fetch(razorpayPaymentId),
    ]);

    if (!order || !payment || payment.order_id !== razorpayOrderId) {
      return res.status(400).send({
        validate: false,
        message: "Payment details do not match the order",
      });
    }

    if (Number(order.amount) !== bookingDetails.amountInInr * 100) {
      return res.status(400).send({
        validate: false,
        message: "Paid amount does not match booking amount",
      });
    }

    if (!["authorized", "captured"].includes(payment.status)) {
      return res.status(400).send({
        validate: false,
        message: "Payment is not authorized yet",
      });
    }

    const duplicateBooking = await db.query(
      `SELECT booking_id FROM video_call_bookings
       WHERE payment_id = $1 OR payment_order_id = $2
       LIMIT 1`,
      [razorpayPaymentId, razorpayOrderId]
    );

    if (duplicateBooking.rows.length > 0) {
      return res.status(409).send({
        validate: false,
        message: "This payment has already been used for a booking",
        bookingId: duplicateBooking.rows[0].booking_id,
      });
    }

    const user = req.user;
    const bookingId = `BOOK-${uuidv4().slice(0, 8).toUpperCase()}`;
    const streamSessionId = `session_${bookingId}`;

    const result = await db.query(
      `INSERT INTO video_call_bookings (
        booking_id, user_email, user_name, session_type, scheduled_time, duration, status, stream_session_id,
        payment_order_id, payment_id, payment_signature, amount_paid, currency, payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        bookingId,
        user.email,
        user.fullname,
        bookingDetails.sessionType,
        bookingDetails.scheduledDate.toISOString(),
        bookingDetails.duration,
        "confirmed",
        streamSessionId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        Number(order.amount),
        order.currency || RAZORPAY_CURRENCY,
        payment.status || "captured",
      ]
    );

    emitRealtimeEvent(
      createRealtimeEvent("booking.created", {
        booking: result.rows[0],
      }),
      {
        targetUserEmail: user.email,
        includeAdmins: true,
      }
    );

    return res.send({
      validate: true,
      message: "Payment successful and booking confirmed",
      booking: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).send({
        validate: false,
        message: "This payment is already linked to a booking",
      });
    }

    console.error("Verify payment and book error:", err);
    return res.status(500).send({
      validate: false,
      message: "Unable to verify payment and confirm booking",
    });
  }
});

// Legacy direct booking route (admin only; users must pay first)
router.post("/video-call/create", checkauth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(402).send({
        validate: false,
        message: "Payment required. Please complete Razorpay checkout to confirm this booking.",
      });
    }

    const { sessionType, scheduledTime, duration } = req.body;
    const bookingId = `BOOK-${uuidv4().slice(0, 8).toUpperCase()}`;
    const streamSessionId = `session_${bookingId}`;

    const result = await db.query(
      `INSERT INTO video_call_bookings (booking_id, user_email, user_name, session_type, scheduled_time, duration, status, stream_session_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        bookingId,
        req.user.email,
        req.user.fullname,
        sessionType,
        scheduledTime,
        duration || 30,
        "pending",
        streamSessionId,
      ]
    );

    emitRealtimeEvent(
      createRealtimeEvent("booking.created", {
        booking: result.rows[0],
      }),
      {
        targetUserEmail: req.user.email,
        includeAdmins: true,
      }
    );

    return res.send({
      validate: true,
      message: "Video call session booked successfully",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ validate: false, message: "Error creating video call session" });
  }
});

// Get user's bookings
router.get("/video-call/bookings", checkauth, async (req, res) => {
  try {
    const user = req.user;
    const result = await db.query(
      "SELECT * FROM video_call_bookings WHERE user_email = $1 ORDER BY scheduled_time DESC",
      [user.email]
    );
    
    res.send({ validate: true, bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error fetching bookings" });
  }
});

// Get all bookings (admin only)
router.get("/video-call/all-bookings", checkauth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).send({ validate: false, message: "Access denied. Admin only." });
    }
    
    const result = await db.query(
      "SELECT * FROM video_call_bookings ORDER BY scheduled_time DESC"
    );
    
    res.send({ validate: true, bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error fetching bookings" });
  }
});

// Update booking status (admin only)
router.put("/video-call/update-status", checkauth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).send({ validate: false, message: "Access denied. Admin only." });
    }
    
    const { bookingId, status } = req.body;
    
    let streamSessionId = null;
    let videoCallUrl = null;
    
    // Generate video call when confirming
    if (status === 'confirmed') {
      const sessionId = `session_${bookingId}_${Date.now()}`;
      
      try {
        // Create video call using Stream REST API
        // Generate JWT token for server-side API call
        const serverToken = jwt.sign(
          { api_key: GETSTREAM_API_KEY },
          GETSTREAM_API_SECRET,
          { algorithm: 'HS256', expiresIn: '1h' }
        );
        
        // Create call via REST API
        const response = await fetch(`https://video.getstream.io/api/v2/calls/default/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${serverToken}`,
            'x-api-key': GETSTREAM_API_KEY
          },
          body: JSON.stringify({
            data: {
              starts_at: new Date().toISOString(),
              custom: {
                bookingId: bookingId
              }
            }
          })
        });
        
        if (response.ok) {
          const callData = await response.json();
          streamSessionId = sessionId;
          videoCallUrl = callData.call?.url || `https://video.getstream.io/${sessionId}`;
        } else {
          // Fallback - use Google Meet
          streamSessionId = sessionId;
          videoCallUrl = `https://meet.google.com/new`;
        }
      } catch (streamErr) {
        console.log("Stream Video error:", streamErr.message);
        // Fallback - use Google Meet
        streamSessionId = sessionId;
        videoCallUrl = `https://meet.google.com/new`;
      }
    }
    
    const result = await db.query(
      "UPDATE video_call_bookings SET status = $1, stream_session_id = $2 WHERE booking_id = $3 RETURNING *",
      [status, streamSessionId, bookingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send({ validate: false, message: "Booking not found" });
    }

    emitRealtimeEvent(
      createRealtimeEvent("booking.updated", {
        booking: result.rows[0],
        videoCallUrl,
      }),
      {
        targetUserEmail: result.rows[0].user_email,
        includeAdmins: true,
      }
    );
    
    res.send({ 
      validate: true, 
      message: "Booking updated successfully", 
      booking: result.rows[0],
      videoCallUrl: videoCallUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error updating booking" });
  }
});

// Delete booking
router.delete("/video-call/delete/:bookingId", checkauth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;
    let bookingRecord = null;
    
    // Check if user is admin or the owner of the booking
    if (req.user.role !== 'admin') {
      const booking = await db.query("SELECT * FROM video_call_bookings WHERE booking_id = $1", [bookingId]);
      if (booking.rows.length === 0 || booking.rows[0].user_email !== user.email) {
        return res.status(403).send({ validate: false, message: "Access denied" });
      }
      bookingRecord = booking.rows[0];
    } else {
      const booking = await db.query("SELECT * FROM video_call_bookings WHERE booking_id = $1", [bookingId]);
      bookingRecord = booking.rows[0] || null;
    }
    
    await db.query("DELETE FROM video_call_bookings WHERE booking_id = $1", [bookingId]);

    if (bookingRecord) {
      emitRealtimeEvent(
        createRealtimeEvent("booking.deleted", {
          booking: bookingRecord,
        }),
        {
          targetUserEmail: bookingRecord.user_email,
          includeAdmins: true,
        }
      );
    }
    
    res.send({ validate: true, message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error deleting booking" });
  }
});

// Get all users (admin only)
router.get("/admin/users", checkauth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({ validate: false, message: "Access denied. Admin only." });
    }
    
    const result = await db.query("SELECT id, fullname, email, role, profilepic, created_at FROM users ORDER BY created_at DESC");
    
    res.send({ validate: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error fetching users" });
  }
});

// Update user role (admin only)
router.put("/admin/update-role", checkauth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({ validate: false, message: "Access denied. Admin only." });
    }
    
    const { email, role } = req.body;
    
    const result = await db.query(
      "UPDATE users SET role = $1 WHERE email = $2 RETURNING *",
      [role, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send({ validate: false, message: "User not found" });
    }

    emitRealtimeEvent(
      createRealtimeEvent("admin.user_role_updated", {
        user: result.rows[0],
      }),
      {
        targetUserEmail: result.rows[0].email,
        includeAdmins: true,
      }
    );
    
    res.send({ validate: true, message: "User role updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error updating user role" });
  }
});


// export router
// Get video call token for Stream
router.get("/video-call/token", checkauth, async (req, res) => {
  try {
    const user = req.user;
    
    console.log("Token request for user:", user.email);
    
    // Generate token using JWT with proper Stream Video format
    // Stream Video requires: user_id, api_key, and optionally exp
    const token = jwt.sign(
      { 
        sub: user.email.toString(),
        user_id: user.email.toString(),
        api_key: GETSTREAM_API_KEY
      },
      GETSTREAM_API_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );
    
    console.log("Generated token successfully");
    
    res.send({
      validate: true,
      token: token,
      apiKey: GETSTREAM_API_KEY,
      userId: user.email
    });
  } catch (err) {
    console.error("Error generating video token:", err);
    res.status(500).send({ validate: false, message: "Error generating video token: " + err.message });
  }
});

export default router;
export { checkauth, db, getUserByEmail };
