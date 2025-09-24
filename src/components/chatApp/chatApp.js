import React, { useState, useRef, useEffect } from "react";
import {io} from "socket.io-client";
import NewNavBar from "../newNavBar/newNavBar";
import PastChat from "../pastChat/pastChat";
import axios from "axios";
import "./chatApp.css";

function ChatApp() {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const senderEmail = localStorage.getItem("email");
  const senderUsername = localStorage.getItem("username") || "You";
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io("https://peersphere-3.onrender.com", {
      path: "/socket.io",
      transports : ["websocket"],
    });
    socketRef.current.emit("join", senderEmail);
    socketRef.current.on("receiveMessage", (msg) =>{
      if(msg.senderEmail == senderEmail) return;
      setMessages((prev) => [...prev, {
        senderId : {email:msg.senderEmail, username : msg.senderEmail},
        text:msg.text,
        createdAt:msg.createdAt,
      }]);
    });
    return() => {
      socketRef.current.disconnect();
    };
  }, [senderEmail]);


  // Fetch messages between logged-in user and receiver
  const fetchMessages = async () => {
    if (!receiverEmail) return;

    try {
      const response = await axios.get("https://peersphere-3.onrender.com/api/messages", {
        params: { senderEmail, receiverEmail },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Start chat
  const startChat = async () => {
    if (!receiverEmail.trim()) return;

    if (receiverEmail === senderEmail) {
      alert("You cannot start a chat with yourself.");
      return;
    }

    setChatStarted(true);
    await fetchMessages();
  };

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    if (receiverEmail === senderEmail) {
      alert("You cannot send messages to yourself.");
      return;
    }

    const newMsg = { senderEmail, receiverEmail, text: input };

    try {
      // Add locally for instant UI update
      setMessages((prev) => [
        ...prev, //if u use ...messages, then u may miss the previous updated data
        {
          senderId: { email: senderEmail, username: senderUsername },
          text: input,
          createdAt: new Date().toISOString(), // add current timestamp
        },
      ]);
      setInput("");

      socketRef.current.emit("sendMessage", newMsg);

      // Optionally, refetch messages to sync server timestamps
      // await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to format timestamp nicely
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString(); // e.g., "9/22/2025, 7:45:00 PM"
  };

  return (
    <div className="chat-app-wrapper">
      <PastChat />
      <div className="main-content">
        <NewNavBar />
        <button className="new-chat">New Chat</button>

        <div className="current-chat">
          {!chatStarted ? (
            <input
              type="email"
              value={receiverEmail}
              placeholder="Enter receiver email"
              className="email-input-line"
              onChange={(e) => setReceiverEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
          ) : (
            <>
              <div className="receiver-email">{receiverEmail}</div>
              <div className="chat-window">
                {messages.map((msg, index) => {
                  const isMe =
                    msg.senderId?.email === senderEmail;
                    console.log("Added",msg.senderId);
                  return (
                    <div key={index} className={`chat-message ${isMe ? "me" : "other"}`}>
                      <span className="user-name">
                        {isMe ? "Me" : msg.senderId?.username || msg.senderId?.email}:
                      </span>{" "}
                      {msg.text}
                      <div className="message-timestamp">
                        {formatTimestamp(msg.createdAt)}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}></div>
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  placeholder="Type a message..."
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
