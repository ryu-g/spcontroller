// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // フロントエンド用ファイルを配信

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // スマホからの操作を受信
    socket.on("act", (data) => {
        console.log("action command:", data);
        // PC側にアクションコマンドを送信
        socket.broadcast.emit("updateAction", data);
    });
    
    socket.on("move", (data) => {
        console.log("Move command:", data);
        // PC側に移動コマンドを送信
        socket.broadcast.emit("updatePosition", data);
    });
    
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
