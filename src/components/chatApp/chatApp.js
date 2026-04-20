import React, { useState, useRef, useEffect } from "react";
import {io} from "socket.io-client";
import NewNavBar from "../newNavBar/newNavBar";
import ChatList from "../ChatList/ChatList";
import axios from "axios";
import "./chatApp.css";

function ChatApp() {
  const [receiverUsername, setReceiverUsername] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const senderUsername = localStorage.getItem("username") || "You";
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io("https://peersphere-3.onrender.com", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });
    socketRef.current.emit("join");
    socketRef.current.on("receiveMessage", (msg) =>{
      setMessages((prev) => [...prev, {
        senderId : {username : msg.senderUsername},
        text:msg.text,
        createdAt:msg.createdAt,
      }]);
    });
    return() => {
      socketRef.current.disconnect();
    };
  }, [senderUsername]);


  // Fetch messages between logged-in user and receiver
  const fetchMessages = async () => {
    if (!receiverUsername) return;

    try {
      const response = await axios.get("https://peersphere-3.onrender.com/api/messages", {
        params: { senderUsername, receiverUsername},
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      setMessages(response.data.messages);
    } catch (err) {
      // console.log(err);
      console.error("Error fetching messages:", err);
    }
  };

  // Start chat
  const startChat = async () => {
  if (!receiverUsername.trim()) return;
  // <div className="receiver-email">
  //   {selectedContact?.username || receiverUsername}
  // </div>

  if (receiverUsername === senderUsername) {
    alert("You cannot start a chat with yourself.");
    return;
  }

  try {
    // Check if the user exists
    const res = await axios.get(
      "https://peersphere-3.onrender.com/api/users/findByUserName", // change this while pushing to github
      {
        params: { username: receiverUsername },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.data || !res.data.email) {
      alert("User does not exist.");
      setReceiverUsername(""); // clear input
      return;
    }
    console.log(res);

    setChatStarted(true);
    await fetchMessages(); // fetch messages with this user
  } catch (err) {
    if (err.response && err.response.status === 404) {
      alert("User does not exist.");
      setReceiverUsername(""); // clear input
    } else {
      console.error("Error checking user:", err);
    }
  }

};

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    if (receiverUsername === senderUsername) {
      alert("You cannot send messages to yourself.");
      return;
    }

    const newMsg = {receiverUsername, text: input };

    try {
      // Add locally for instant UI update
      setMessages((prev) => [
        ...prev, //if u use ...messages, then u may miss the previous updated data
        {
          senderId: {username: senderUsername },
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
      <ChatList
      token={token}
      currentUserName={senderUsername}
      onSelectContact={(contact) => {
        // setSelectedContact(contact);
        setReceiverUsername(contact.receiverUserName);
        setChatStarted(true);
        fetchMessages(); // fetch messages with this contact
      }}
    />
      
      <div className="main-content">
        <NewNavBar />

        <div className="current-chat">
          {!chatStarted ? (
            <input
              type="text"
              value={receiverUsername}
              placeholder="Enter receiver username"
              className="username-input-line"
              onChange={(e) => setReceiverUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
          ) : (
            <>
              <div className="chat-window">
                {messages.map((msg, index) => {
                  const isMe =
                    msg.senderId?.username === senderUsername;
                    console.log("Added",msg.senderId);
                  return (
                    <div key={index} className={`chat-message ${isMe ? "me" : "other"}`}>
                      <span className="user-name">
                        {isMe ? "You" : msg.senderId?.username || msg.senderId?.email}:
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
                <textarea
                  value={input}
                  placeholder="Type a message..."
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}                // default visible lines
                  className="chat-input-textarea"
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
