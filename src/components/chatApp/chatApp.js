import React, { useState, useRef, useEffect } from "react";
import NewNavBar from "../newNavBar/newNavBar";
import PastChat from "../pastChat/pastChat";
import "./chatApp.css";

function ChatApp() {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const startChat = () => {
    if (receiverEmail.trim() !== "") setChatStarted(true);
  };

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { sender: "Me", text: input }]);
    setInput("");

    // Simulate reply for demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: receiverEmail, text: "Reply from " + receiverEmail },
      ]);
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-app-wrapper">
      <PastChat /> {/* Sidebar */}
      <div className="main-content">
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
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === "Me" ? "me" : "other"}`}
              >
                <span className="user-name">{msg.sender}:</span> {msg.text}
              </div>
            ))}
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

        <NewNavBar /> {/* Navbar */}
        <button className="new-chat">New Chat</button>
        <div className="receiver-email">{receiverEmail}</div>
        
      </div>
    </div>
  );
}

export default ChatApp;
