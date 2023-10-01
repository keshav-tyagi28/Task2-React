const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();


app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = 3004; // Choose a port for this WebSocket server

const rooms = {}; // Store chat rooms and their messages


io.on("connection", (socket) => {
  console.log(`User Connected to Chat Server: ${socket.id}`);

  // Join a chat room
  socket.on("join_room", (data) => {
    const { room } = data;
    socket.join(room);

    // Create the room if it doesn't exist
    if (!rooms[room]) {
      rooms[room] = [];
    }

    // Send previous messages to the client
    socket.emit("previous_messages", rooms[room]);

    // Notify others in the room about the new user
    socket.to(room).emit("user_joined", { user: socket.id });
  });

  // Send a message to the chat room
  socket.on("send_message", (data) => {
    const { room, message } = data;
    const messageData = { user: socket.id, message };

    // Store the message
    rooms[room].push(messageData);

    // Broadcast the message to everyone in the room
    socket.to(room).emit("receive_message", messageData);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Start the Express.js server on the specified port
httpServer.listen(PORT, () => {
  console.log(`Chat server is running on port ${PORT}`);
});
