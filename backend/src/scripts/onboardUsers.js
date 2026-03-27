import pg from "pg";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config();

// GetStream configuration - ensure proper string handling
const GETSTREAM_API_KEY = String(process.env.GETSTREAM_API_KEY || "-1417325");
const GETSTREAM_API_SECRET = String(process.env.GETSTREAM_API_SECRET || "bmsndsx5dq22fnw64bvnv54cw8kqfnhhjzdgwdh5nhye2g4gyqd8w8jfd5ttpm9x");

console.log("GetStream API Key:", GETSTREAM_API_KEY);

// Initialize Stream Chat client
const streamClient = StreamChat.getInstance(GETSTREAM_API_KEY, GETSTREAM_API_SECRET);

// Database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "chatroom",
  password: "123456",
  port: 5432,
});

async function onboardAllUsers() {
  try {
    await db.connect();
    console.log("Connected to database");

    // Fetch all users from database
    const result = await db.query("SELECT * FROM users");
    const users = result.rows;

    console.log(`Found ${users.length} users to onboard to GetStream`);

    // Create Stream users in batches
    const batchSize = 30;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const streamUsers = batch.map(user => {
        const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        return {
          id: streamUserId,
          name: user.fullname || user.email.split("@")[0],
          image: user.profilepic || "",
        };
      });

      try {
        await streamClient.upsertUsers(streamUsers);
        successCount += batch.length;
        console.log(`Onboarded ${successCount}/${users.length} users to GetStream`);
      } catch (error) {
        console.error(`Error upserting batch ${i / batchSize + 1}:`, error.message);
        errorCount += batch.length;
      }
    }

    console.log("\n=== Onboarding Complete ===");
    console.log(`Total users: ${users.length}`);
    console.log(`Successfully onboarded: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error("Error during onboarding:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

// Run the onboarding
onboardAllUsers();
