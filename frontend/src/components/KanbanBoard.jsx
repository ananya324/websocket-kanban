import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const SOCKET_URL = "http://localhost:5000";

function KanbanBoard({ socketProp, onDragEndTest }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = socketProp || io(SOCKET_URL);
    const socket = socketRef.current;

    socket.emit("sync:tasks");

    socket.on("sync:tasks", (serverTasks) => {
      setTasks(serverTasks);
      setLoading(false);
    });

    return () => {
      socket.off("sync:tasks");
      if (!socketProp) socket.disconnect();
    };
  }, [socketProp]);


  const socket = socketRef.current;

  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: `Task ${tasks.length + 1}`,
      description: "",
      status: "todo",
      priority: "low",
      category: "feature",
      attachments: [],
    };
    setTasks((prev) => [...prev, newTask]);
    socket?.emit("task:create", newTask);
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    socket?.emit("task:update", { id, ...updates });
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    socket?.emit("task:delete", id);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    setTasks((prev) => {
      const newTasks = [...prev];
      const draggedIndex = newTasks.findIndex((t) => t.id === draggableId);
      const [draggedTask] = newTasks.splice(draggedIndex, 1);
      draggedTask.status = destination.droppableId;

      const destIndexes = newTasks
        .map((t, i) => ({ ...t, i }))
        .filter((t) => t.status === destination.droppableId);

      const insertIndex = destIndexes[destination.index]?.i ?? newTasks.length;
      newTasks.splice(insertIndex, 0, draggedTask);

      return newTasks;
    });

    socket?.emit("task:move", {
      taskId: draggableId,
      newStatus: destination.droppableId,
    });
  };
  useEffect(() => {
  if (typeof window !== "undefined") {
    window.__KANBAN_BOARD__ = {
      drag: handleDragEnd
    };
  }
}, [tasks]);

  const handleFileUpload = (id, file) => {
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      alert("Unsupported file type");
      return;
    }

    const url = URL.createObjectURL(file);
    updateTask(id, {
      attachments: [{ name: file.name, url, type: file.type }],
    });
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const chartData = [
    { name: "To Do", count: columns.todo.length },
    { name: "In Progress", count: columns.inprogress.length },
    { name: "Done", count: columns.done.length },
  ];

  const completion =
    tasks.length === 0
      ? 0
      : Math.round((columns.done.length / tasks.length) * 100);

  const Column = ({ title, status }) => (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          data-testid={`column-${status}`}
          style={{
            width: 300,
            minHeight: 400,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <h3>{title}</h3>

          {columns[status].map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  data-testid={`task-${task.id}`}
                  style={{
                    padding: 10,
                    marginBottom: 10,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    ...provided.draggableProps.style,
                  }}
                >
                  {/* Title input with data-testid */}
                  <input
                    type="text"
                    data-testid={`title-${task.id}`}
                    value={task.title}
                    onChange={(e) =>
                      updateTask(task.id, { title: e.target.value })
                    }
                  />

                  {/* Priority select */}
                  <select
                    data-testid={`priority-${task.id}`}
                    value={task.priority}
                    onChange={(e) =>
                      updateTask(task.id, { priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  {/* Category select */}
                  <select
                    data-testid={`category-${task.id}`}
                    value={task.category}
                    onChange={(e) =>
                      updateTask(task.id, { category: e.target.value })
                    }
                  >
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="enhancement">Enhancement</option>
                  </select>

                  {/* File input */}
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload(task.id, e.target.files[0])
                    }
                  />

                  {task.attachments?.map((f) => (
                    <div key={f.url}>
                      {f.type.startsWith("image") ? (
                        <img src={f.url} alt="" width={80} />
                      ) : (
                        <a href={f.url}>{f.name}</a>
                      )}
                    </div>
                  ))}

                  <button onClick={() => deleteTask(task.id)}>🗑 Delete</button>
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Real-time Kanban Board</h2>

      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>

      <p>Completion: {completion}%</p>

      <button onClick={addTask}>Add Task</button>

      <DragDropContext onDragEnd={onDragEndTest || handleDragEnd}>
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <Column title="To Do" status="todo" />
          <Column title="In Progress" status="inprogress" />
          <Column title="Done" status="done" />
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;


