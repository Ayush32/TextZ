const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "TextZ Bot";

// run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {

    const user = userJoin(socket.id,username,room)

    socket.join(user.room)

    // Welcome current User
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord"));

    // broadcast when a user connects
    // On the server-side, you can send an event to all connected clients or to a subset of clients:
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} joined the chat`));

      // send users and room info
      io.to(user.room).emit('roomUsers', {
        room : user.room,
        users : getRoomUsers(user.room)
      })
  });
  
  // console.log('New WS Connection....')

  //Listen for ChatMessages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit("message", formatMessage(user.username, msg));
    // console.log(msg)
  })
    // Runs when client disconnect
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user) 
        {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} left the chat`))
           
            // send users and room info
            io.to(user.room).emit('roomUsers', {
              room : user.room,
              users : getRoomUsers(user.room)
            })
        }
      
    });
  });
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
