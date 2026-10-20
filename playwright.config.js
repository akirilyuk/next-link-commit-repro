const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  workers: 1,
  retries: 0,
  reporter: [["line"], ["json", { outputFile: "results/report.json" }]],
  outputDir: "results/artifacts",
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx next start -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000/items",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
