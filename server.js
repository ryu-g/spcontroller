// server.js
// test
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public")); // フロントエンド用ファイルを配信

function clients(){
    const clients = [];
    io.sockets.sockets.forEach(s => {
        if(s.isController) clients.push({ id: s.id, x: s.x, y: s.y });
    });
    return clients
}

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.x = 0
    socket.y = 0
    socket.isController = false

    // スマホからの操作を受信
    socket.on("enter", (data) => {
        console.log("enter new user", data);
        socket.isController = true
        socket.broadcast.emit("updatePosition", clients());
    });

    socket.on("act", (data) => {
        console.log("action command:", data);
        socket.broadcast.emit("updateAction", {id: socket.id, kind: data.kind});
    });
    
    socket.on("move", (data) => {
        console.log("Move command:", data);
        switch(data.direction){
            case "up":socket.y--;break;
            case "down":socket.y++;break;
            case "right":socket.x--;break;
            case "left":socket.x++;break;
        }        
        socket.broadcast.emit("updatePosition", clients());
    });
    
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      socket.broadcast.emit("updatePosition", clients());
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
