import { defineConfig, devices } from "@playwright/test";

// Mobile first: the phone project runs before tablet and desktop.
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:3000", channel: "chrome" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
