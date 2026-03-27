import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { ToastContainer, toast } from "react-toastify";
import "stream-chat-react/css/v2/index.css";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../lib/config";

// GetStream API Key from environment variable
const STREAM_API_KEY = import.meta.env.VITE_GETSTREAM_API_KEY || "kjuyb9r35pvr";

const ChatPage = () => {
  const { memberEmail } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Get current user from auth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(apiUrl("/auth/user"), {
          credentials: "include",
        });
        const data = await response.json();
        if (data.validate) {
          setUser(data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // Initialize Stream Chat
  useEffect(() => {
    const initChat = async () => {
      if (!user || !memberEmail) return;

      try {
        console.log("Initializing stream chat client...");

        // Get Stream token from backend
        const tokenResponse = await fetch(apiUrl("/chat/token"), {
          credentials: "include",
        });
        const tokenData = await tokenResponse.json();

        if (!tokenData.token) {
          throw new Error("Failed to get Stream token");
        }

        // Create Stream Chat client
        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Convert email to Stream user ID format
        const streamUserId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const streamMemberId = `user_${memberEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

        // Connect user
        await client.connectUser(
          {
            id: streamUserId,
            name: user.fullname || user.email.split("@")[0],
            image: user.profilepic || "",
          },
          tokenData.token
        );

        // Create unique channel ID based on both user IDs (sorted)
        const channelId = [streamUserId, streamMemberId].sort().join("-");

        // Create or join messaging channel
        const currChannel = client.channel("messaging", channelId, {
          members: [streamUserId, streamMemberId],
          name: `Chat with ${memberEmail}`,
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user && memberEmail) {
      initChat();
    }
  }, [user, memberEmail]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [chatClient]);

  if (loading || !chatClient || !channel) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading chat...</p>
        <style>{`
          .chat-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f5f5f5;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #5a67d8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h2>Chat with {memberEmail}</h2>
      </div>
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <div className="chat-window">
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>
      <ToastContainer />
      <style>{`
        .chat-page-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f5f5;
        }
        .chat-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .back-button {
          padding: 8px 16px;
          background: #5a67d8;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 15px;
          font-size: 14px;
        }
        .back-button:hover {
          background: #4c51bf;
        }
        .chat-header h2 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
        .chat-window {
          height: calc(100vh - 60px);
        }
        .str-chat {
          height: 100%;
        }
        .str-chat__channel {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
