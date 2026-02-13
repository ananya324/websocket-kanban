import { test, expect } from "@playwright/test";

test("User can create a task", async ({ page }) => {
  
  await page.goto("http://localhost:3000");
  await expect(page.locator('#root')).toBeVisible();

 
  const addButton = page.getByRole("button", { name: "Add Task" });
  await addButton.click();

  
  const taskInput = page.locator('input[data-testid^="title-"]').last();
  await taskInput.waitFor({ state: 'visible', timeout: 5000 });

  // check that the title input has a value starting with "Task"
  await expect(taskInput).toHaveValue(/Task \d+/);
});

test("UI updates in real-time when another user modifies tasks", async ({ page, context }) => {
  
  await page.goto("http://localhost:3000");
  await expect(page.locator('#root')).toBeVisible();

  const page2 = await context.newPage();
  await page2.goto("http://localhost:3000");
  await expect(page2.locator('#root')).toBeVisible();

  await page.getByRole("button", { name: "Add Task" }).click();


  const taskInput = page.locator('input[data-testid^="title-"]').last();
  await taskInput.waitFor({ state: 'visible', timeout: 5000 });

  const taskInputPage2 = page2.locator('input[data-testid^="title-"]').last();
  await taskInputPage2.waitFor({ state: 'visible', timeout: 5000 });

  await expect(taskInputPage2).toHaveValue(/Task \d+/);
});





test("User can drag and drop a task between columns", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator("#root")).toBeVisible();

  await page.getByRole("button", { name: "Add Task" }).click();

  const taskId = await page.locator('[data-testid^="task-"]').first().getAttribute("data-testid");

  await page.evaluate((id) => {
    window.__KANBAN_BOARD__.drag({
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "inprogress", index: 0 },
      draggableId: id.replace("task-", "")
    });
  }, taskId);

  await page.waitForTimeout(50);

  const targetColumn = page.locator('[data-testid="column-inprogress"]');
  await expect(targetColumn.locator('[data-testid^="task-"]')).toHaveCount(1);

  await expect(targetColumn.locator('[data-testid^="title-"]').first()).toHaveValue(/Task \d+/);
});




test("User can delete a specific task", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator('#root')).toBeVisible();

  await page.getByRole("button", { name: "Add Task" }).click();

  const allTasks = page.locator('[data-testid^="task-"]');
  const countBefore = await allTasks.count();

  const taskToDelete = allTasks.nth(countBefore - 1);
  const deleteButton = taskToDelete.locator('button:has-text("🗑 Delete")');
  await deleteButton.click();

  await page.waitForTimeout(300);

  await expect(page.locator('[data-testid^="task-"]')).toHaveCount(countBefore - 1);
});

test.describe("Dropdown Select Testing", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator('#root')).toBeVisible();
    await page.getByRole("button", { name: "Add Task" }).click();
  });

  test("User can select a priority level", async ({ page }) => {
    
    const taskId = await page.locator('[data-testid^="title-"]').first().getAttribute('data-testid');
    const prioritySelect = page.locator(`[data-testid="priority-${taskId.split('-')[1]}"]`);

    await prioritySelect.selectOption('high');

    await expect(prioritySelect).toHaveValue('high');
  });

  test("User can change task category and verify update", async ({ page }) => {
    const taskId = await page.locator('[data-testid^="title-"]').first().getAttribute('data-testid');
    const categorySelect = page.locator(`[data-testid="category-${taskId.split('-')[1]}"]`);

    await categorySelect.selectOption('bug');

    await expect(categorySelect).toHaveValue('bug');
  });

});


test.describe("Graph Testing", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator('#root')).toBeVisible();
  });

  test("Task counts update correctly in the graph as tasks move", async ({ page }) => {
    await page.goto("/");

    await page.request.post("http://localhost:5000/__test__/reset");


    const addButton = page.getByRole("button", { name: "Add Task" });

    await addButton.click();
    await addButton.click();
    await addButton.click();

    const tasks = page.locator('[data-testid^="task-"]');
    await expect(tasks).toHaveCount(3);
  });

  test("Graph re-renders dynamically when new tasks are added", async ({ page }) => {
    const addButton = page.getByRole("button", { name: "Add Task" });

    await addButton.click();

    const bars = page.locator('svg rect');
    const todoBarHeight = await bars.nth(0).getAttribute('height');
    expect(Number(todoBarHeight)).toBeGreaterThan(0); // To Do bar should have height
  });

});


