const path = require("node:path");
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: path.join(__dirname, "nav-probe.js") });
});

async function attachProbe(page, testInfo, requests) {
  const probe = await page.evaluate(() => ({
    url: location.href,
    events: window.__navProbe.events,
    committedAt: window.__navProbe.committedAt ?? null,
    lanes: window.__navProbe.lanes(),
    rsc: window.__navProbe.rsc,
  }));
  await testInfo.attach("nav-probe.json", {
    body: JSON.stringify({ probe, rscRequests: requests }, null, 2),
    contentType: "application/json",
  });
}

test("clicking a row link navigates to the item page", async ({ page }, testInfo) => {
  const requests = [];
  const start = Date.now();
  page.on("requestfinished", (req) => {
    if (!req.url().includes("_rsc=")) return;
    // Requests can finish while the context closes; never fail the test from here.
    (async () => {
      const h = await req.allHeaders();
      const res = await req.response();
      const sizes = await req.sizes().catch(() => null);
      requests.push({
        t: req.timing().startTime - start,
        url: req.url().replace(/^https?:\/\/[^/]+/, ""),
        prefetch: h["next-router-prefetch"] ?? null,
        segmentPrefetch: h["next-router-segment-prefetch"] ?? null,
        stateTree: h["next-router-state-tree"] ? decodeURIComponent(h["next-router-state-tree"]).slice(0, 300) : null,
        status: res?.status() ?? null,
        bodyBytes: sizes?.responseBodySize ?? null,
      });
    })().catch(() => {});
  });

  await page.goto("/items");
  await page.getByTestId("row-7").click();
  try {
    await expect(page).toHaveURL(/\/items\/7$/, { timeout: 15_000 });
    await expect(page.getByTestId("item-page")).toBeVisible();
    if (process.env.PROBE_ALWAYS) {
      await page.waitForTimeout(1000); // let the prefetch bursts finish before the dump
      await attachProbe(page, testInfo, requests);
    }
  } catch (err) {
    await attachProbe(page, testInfo, requests);
    throw err;
  }
});
