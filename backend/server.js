const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tasks = [];

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


  socket.on("tasks:reset", () => {
    tasks = [];
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
