
const express = require("express");
const next = require("next");
const http = require("http");
const socketio  = require("socket.io");

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
    const app = express();
    const server = http.createServer(app);
    const io = new socketio.Server();
    io.attach(server);

    app.get('/hello', async (_, res) => {
        res.send('Hello World')
    });

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

      });

    app.all('*', (req, res) => nextHandler(req, res));

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});