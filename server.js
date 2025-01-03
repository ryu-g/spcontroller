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
        if(s.isController) clients.push({ id: s.id, x: s.x, y: s.y, color: s.color });
    });
    return clients
}

function generateRGB(str) {
    // 文字列をハッシュ化（ここでは簡単に文字列のUTF-16コードを使ってハッシュ化）
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i); // 簡単なハッシュ関数
    }

    // RGB各色成分を計算（0-255の範囲に収める）
    const r = (hash >> 16) & 0xFF;  // 16ビットを赤色成分に
    const g = (hash >> 8) & 0xFF;   // 8ビットを緑色成分に
    const b = hash & 0xFF;          // 下位8ビットを青色成分に

    // RGB形式で返す（#RRGGBB形式）
    return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
}


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.x = 0
    socket.y = 0
    socket.color = "#000000"
    socket.isController = false

    // スマホからの操作を受信
    socket.on("enter", (data) => {
        console.log("enter new user", data);
        socket.isController = true
        socket.color = generateRGB(socket.id)
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
            case "right":socket.x++;break;
            case "left":socket.x--;break;
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
