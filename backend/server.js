const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tasks = [];
// 🔹 Test-only reset endpoint (for Playwright)
app.post("/__test__/reset", (req, res) => {
  tasks = [];
  res.sendStatus(200);
});


io.on("connection", (socket) => {
  console.log("A user connected");

  // Send tasks to new client
  socket.emit("sync:tasks", tasks);

  socket.on("task:create", (task) => {
    tasks.push(task);
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:move", ({ taskId, newStatus }) => {
    tasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    );
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map(task =>
      task.id === updatedTask.id
        ? { ...task, ...updatedTask }
        : task
    );
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:delete", (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    io.emit("sync:tasks", tasks);
  });

  // ✅ ADD THIS HERE (test-only helper)
  socket.on("tasks:reset", () => {
    tasks = [];
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
