const express = require("express");
const next = require("next");
const http = require("http");
const socketIO  = require("socket.io");

var app = express();
var server = http.createServer(app);
var io = socketIO(server);


const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {

    io.on("connection", (socket) => {
      
      socket.emit("me", socket.id)

      socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
      })

      socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
      })

      socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
      })
    })


    // Using Express Route to handle routing on the backend
    const showRoutes = require("./routes/index.js");

    app.use("/api", showRoutes(app));

    app.get("*", (req, res) => {
      return nextHandler(req, res);
    });
    server.listen(PORT);

  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

  