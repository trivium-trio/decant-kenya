import { defineConfig, devices } from "@playwright/test";

// Mobile first: the phone project runs before tablet and desktop.
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"] } },
    { name: "tablet", use: { ...devices["iPad (gen 7)"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
