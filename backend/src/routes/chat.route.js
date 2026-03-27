import express from "express";
import { checkauth } from "../auth.js";
import { getStreamToken, upsertUser, createChannel } from "../controller/chat.controller.js";
import { streamClient } from "../lib/stream.js";

const router = express.Router();

// Middleware to attach Stream client to request
const attachStreamClient = (req, res, next) => {
  req.chatClient = streamClient;
  next();
};

// Apply middleware to all routes
router.use(attachStreamClient);

// Get Stream Chat token
router.get("/token", checkauth, getStreamToken);

// Upsert Stream user profile
router.post("/user", checkauth, upsertUser);

// Create a new messaging channel
router.post("/channel", checkauth, createChannel);

export default router;
