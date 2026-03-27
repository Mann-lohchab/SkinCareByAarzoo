import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.GETSTREAM_API_KEY;
const apiSecret = process.env.GETSTREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("GetStream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// Upsert a user in Stream (create or update)
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

// Generate a Stream token for a user
export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};

// Create a new channel
export const createStreamChannel = async (channelData) => {
  try {
    const channel = streamClient.channel(channelData.type, channelData.id, channelData);
    await channel.create();
    return channel;
  } catch (error) {
    console.error("Error creating Stream channel:", error);
    throw error;
  }
};

// Get channel by ID
export const getStreamChannel = async (channelType, channelId) => {
  try {
    const channel = streamClient.channel(channelType, channelId);
    return channel;
  } catch (error) {
    console.error("Error getting Stream channel:", error);
    throw error;
  }
};

// Add member to channel
export const addChannelMember = async (channelType, channelId, userId) => {
  try {
    const channel = streamClient.channel(channelType, channelId);
    await channel.addMembers([userId]);
    return channel;
  } catch (error) {
    console.error("Error adding member to channel:", error);
    throw error;
  }
};

// Export the Stream client for direct access if needed
export { streamClient };
