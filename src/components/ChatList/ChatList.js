import React, { useEffect, useState } from "react";
import axios from "axios";
const backend_url = process.env.REACT_APP_BACKEND_URL;
export default function ChatList({ token, currentUserEmail, onSelectContact }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/chatContacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(res.data.contacts);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchContacts();
  }, [token]);

  return (
    <div className="chat-list">
      {contacts.map((contact) => (
        <div
          key={contact.email}
          className="chat-list-item"
          onClick={() => onSelectContact(contact)}
        >
          <span className="contact-name">{contact.username || contact.email}</span>
        </div>
      ))}
    </div>
  );
}