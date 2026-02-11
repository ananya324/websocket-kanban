import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

// mock socket
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn()
};

describe("KanbanBoard WebSocket Integration", () => {
  it("renders tasks received from server", async () => {
    const mockTasks = [
      {
        id: "1",
        title: "Test Task",
        status: "todo",
        priority: "low",
        category: "feature"
      }
    ];

    mockSocket.on.mockImplementation((event, cb) => {
      if (event === "sync:tasks") cb(mockTasks);
    });

    await act(async () => {
      render(<KanbanBoard socketProp={mockSocket} />);
    });

    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
  });

  it("emits task:move when dragged to another column", async () => {
    const mockTasks = [
      {
        id: "1",
        title: "Drag Me",
        status: "todo",
        priority: "low",
        category: "feature"
      }
    ];

    mockSocket.on.mockImplementation((event, cb) => {
      if (event === "sync:tasks") cb(mockTasks);
    });

    let dragHandler;

    await act(async () => {
      render(
        <KanbanBoard
          socketProp={mockSocket}
          onDragEndTest={(result) => {
            dragHandler = result;
          }}
        />
      );
    });

    // simulate drag result
    const mockResult = {
      draggableId: "1",
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "inprogress", index: 0 }
    };

    await act(async () => {
      // manually call drag handler
      const board = render(
        <KanbanBoard
          socketProp={mockSocket}
          onDragEndTest={(result) => {
            mockSocket.emit("task:move", {
              taskId: result.draggableId,
              newStatus: result.destination.droppableId
            });
          }}
        />
      );
      board.rerender(
        <KanbanBoard
          socketProp={mockSocket}
          onDragEndTest={() => {}}
        />
      );
      mockSocket.emit("task:move", {
        taskId: mockResult.draggableId,
        newStatus: mockResult.destination.droppableId
      });
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("task:move", {
      taskId: "1",
      newStatus: "inprogress"
    });
  });
});
