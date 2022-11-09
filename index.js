const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
var cors = require("cors");
const path = require("path");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/uploads");
const useruploadRoute = require("./routes/userupload");
const uploadStoryRoute = require("./routes/uploadStory");
const commentsRoute = require("./routes/comments");
const chatRoute = require("./routes/chats");
const messageRoute = require("./routes/messages");
const storiesRoute = require("./routes/stories");

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/userupload", useruploadRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/stories", storiesRoute);
app.use("/api/uploadStory", uploadStoryRoute);

// app.listen(8800, () => {
//   console.log("running");
// });

const server = app.listen(process.env.PORT || 8800, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
// SOCKET.IO
// SOCKET.IO
// SOCKET.IO
// SOCKET.IO
// SOCKET.IO
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);

    user !== undefined &&
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// SOCKET.IO
