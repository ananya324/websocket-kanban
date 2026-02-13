import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("User can upload a valid image file", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.request.post("http://localhost:5000/__test__/reset");

  await page.getByRole("button", { name: "Add Task" }).click();

  const fileInput = page.locator('input[type="file"]').first();

  const filePath = path.resolve(__dirname, "../fixtures/test-image.png");
  await fileInput.setInputFiles(filePath);

  const imagePreview = page.locator('img');
  await expect(imagePreview).toBeVisible();
});
test("Uploaded PDF file shows as a link", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.request.post("http://localhost:5000/__test__/reset");

  await page.getByRole("button", { name: "Add Task" }).click();

  const fileInput = page.locator('input[type="file"]').first();
  const pdfPath = path.resolve(__dirname, "../fixtures/test-doc.pdf");

  await fileInput.setInputFiles(pdfPath);

  const pdfLink = page.locator('a');
  await expect(pdfLink).toBeVisible();
  await expect(pdfLink).toHaveText("test-doc.pdf");
});
test("Invalid file type shows an error alert", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.request.post("http://localhost:5000/__test__/reset");

  await page.getByRole("button", { name: "Add Task" }).click();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Unsupported file type");
    await dialog.dismiss();
  });

  const fileInput = page.locator('input[type="file"]').first();
  const invalidFilePath = path.resolve(__dirname, "../fixtures/invalid.txt");

  await fileInput.setInputFiles(invalidFilePath);
});
