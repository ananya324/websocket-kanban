import { render, screen } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard";
import { describe, it, expect } from "vitest";

describe("KanbanBoard", () => {
  it("renders Add Task button after loading", async () => {
    render(<KanbanBoard />);

    const addButton = await screen.findByText(/Add Task/i);
    expect(addButton).toBeInTheDocument();
  });
});
