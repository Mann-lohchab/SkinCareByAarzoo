import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";
import { createRealtimeEvent, emitRealtimeEvent } from "../websocket.js";

// Get Stream Chat token for authenticated user
export async function getStreamToken(req, res) {
  try {
    const user = req.user;
    
    // Create a unique Stream user ID from the email
    const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Generate token
    const token = generateStreamToken(streamUserId);
    
    res.status(200).json({ 
      token,
      apiKey: process.env.GETSTREAM_API_KEY,
      userId: streamUserId
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create or update Stream user profile
export async function upsertUser(req, res) {
  try {
    const user = req.user;
    
    const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    await upsertStreamUser({
      id: streamUserId,
      name: user.fullname || user.email.split('@')[0],
      image: user.profilepic || "",
    });
    
    res.status(200).json({ success: true, message: "Stream user updated" });
  } catch (error) {
    console.log("Error in upsertUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get channel details
export async function getChannel(req, res) {
  try {
    const { channelType, channelId } = req.params;
    
    const channel = req.chatClient.channel(channelType, channelId);
    await channel.watch();
    
    res.status(200).json({ channel });
  } catch (error) {
    console.log("Error in getChannel controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create a new messaging channel
export async function createChannel(req, res) {
  try {
    const { memberId } = req.body;
    const user = req.user;
    
    const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const streamMemberId = `user_${memberId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Create a unique channel ID based on both user IDs (sorted to ensure consistency)
    const channelId = [streamUserId, streamMemberId].sort().join("-");
    
    const channel = req.chatClient.channel("messaging", channelId, {
      members: [streamUserId, streamMemberId],
      name: "Chat"
    });
    
    await channel.create();
    await channel.watch();

    emitRealtimeEvent(
      createRealtimeEvent("chat.channel.created", {
        channel: {
          id: channel.id,
          type: channel.type,
          cid: channel.cid,
        },
        memberEmail: memberId,
        createdBy: user.email,
      }),
      {
        targetUserEmail: memberId,
        includeAdmins: true,
      }
    );
    
    res.status(200).json({ 
      success: true, 
      channel: {
        id: channel.id,
        type: channel.type,
        cid: channel.cid
      }
    });
  } catch (error) {
    console.log("Error in createChannel controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
