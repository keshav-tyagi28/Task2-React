// ChatApp.js

import React, { useEffect, useState } from 'react';
import io from "socket.io-client";

const socket = io.connect("http://localhost:3004"); 

function ChatApp() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Join a chat room
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", { room });
    }
  };

  // Send a message to the chat room
  const sendMessage = () => {
    socket.emit("send_message", { room, message });
    setMessage("");
  };

  useEffect(() => {
    // Listen for previous messages
    socket.on("previous_messages", (previousMessages) => {
      setMessages(previousMessages);
    });

    // Listen for new messages
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listen for user join events
    socket.on("user_joined", (data) => {
      setUsers((prevUsers) => [...prevUsers, data.user]);
    });

    return () => {
      if (socket.readyState === 1) { 
          socket.close();
      }
  }
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
      <div>
        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <h2>Chat Room: {room}</h2>
        <div>
          <div>
            <h3>Messages</h3>
            <div>
              {messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.user}:</strong> {msg.message}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Users in Room</h3>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
