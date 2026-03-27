import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import path from "path";
import http from "http";
import authRouter from "./auth.js";
import { getUserByEmail } from "./auth.js";
import paymentRouter from "./payment.js";
import chatRouter from "./routes/chat.route.js";
import { setupWebSocketServer } from "./websocket.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "cache-control"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionMiddleware = session({
  secret: 'the secret key',
  resave: false,
  saveUninitialized: true, 
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',   
    secure: false      
  }
});

app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());
// const
const __dirname = path.resolve();


// routes will go here
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/chat", chatRouter);




// reday for deployment
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,'../frontend/dist')));
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'../frontend/dist/index.html'));
  })
}

setupWebSocketServer({
  server,
  sessionMiddleware,
  getUserByEmail,
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
