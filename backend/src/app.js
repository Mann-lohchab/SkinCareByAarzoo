import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import authRouter from "./auth.js";
import { getUserByEmail } from "./auth.js";
import paymentRouter from "./payment.js";
import chatRouter from "./routes/chat.route.js";

function getAllowedOrigins() {
  return new Set(
    [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
      process.env.APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean)
  );
}

export function createApp() {
  const app = express();
  const PgSession = connectPgSimple(session);
  const allowedOrigins = getAllowedOrigins();
  const isProduction = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "cache-control"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const sessionStore = process.env.DATABASE_URL
    ? new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      })
    : undefined;

  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "change-me-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", authRouter);
  app.use("/api/payment", paymentRouter);
  app.use("/api/chat", chatRouter);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      ok: true,
      websocket: false,
      deployment: process.env.VERCEL ? "vercel" : "node",
    });
  });

  return {
    app,
    sessionMiddleware,
    getUserByEmail,
  };
}

export default createApp;
