const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const homeRoutes = require("./routes/home");
const profileRoutes = require("./routes/profile");
const chatRoutes = require("./routes/chat");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "skillswap_secret",
    resave: false,
    saveUninitialized: false
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/", profileRoutes);
app.use("/chat", chatRoutes);

// 🔥 SOCKET.IO (CORRECT & FINAL)
io.on("connection", (socket) => {

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", {
      message: data.message,
      sender_id: data.sender_id
    });
  });

}); // ✅ THIS WAS MISSING

// Start server
server.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});