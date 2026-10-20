# Link click that never commits (Next.js App Router)

A minimal app for a stochastic App Router bug. A `<Link>` click sends the navigation request and gets a complete `200` RSC response, and then nothing happens: no `history.pushState`, no render, no error, and the URL stays on the old page. Upstream issue: https://github.com/vercel/next.js/issues/100433

**This app has not failed yet.** In our private app the same click fails about 1 time in 100 under the setup below. This app copies that app's route shape and request sequence (a metadata-only prefetch of the target still in flight when the navigation starts), but it passed 1,800 of 1,800 runs on Next 16.2.6. It's published so the shape, the harness and the probe can be reused, and so nobody repeats these runs expecting a failure.

## Shape

```
app/(app)/layout.jsx           async, awaits cookies() on every request, header with 2 <Link>s
app/(app)/loading.jsx          the only loading boundary, above the list and the detail page
app/(app)/items/layout.jsx     force-dynamic, awaits connection(); optional sidebar (SIDEBAR=1)
app/(app)/items/page.jsx       50 rows, each a <Link href="/items/N"> with default prefetch
app/(app)/items/[id]/page.jsx  dynamic detail page, static metadata, no loading.jsx of its own
variants/v2/page.jsx           detail page with generateMetadata and a ~10 KB payload (VARIANT=v2)
app/avatar/route.js            image that holds back the load event by LOAD_DELAY_MS
```

`tests/nav.spec.js` loads `/items`, clicks row 7 as soon as Playwright can, and expects `/items/7` within 15 s. Each repeat uses a fresh browser context. `tests/nav-probe.js` is an init script that records `pushState`/`replaceState`, the click, when the detail page enters the DOM, the timing of each RSC request, and the React root's lane bits. A failing run attaches all of that as `nav-probe.json`, next to a Playwright trace.

## Run

Needs Docker. The container is limited to 2 CPUs because the failure needs CPU contention.

```bash
# base: default prefetch, 600 runs, stop after 3 failures
NEXT_VERSION=16.2.6 RUNS=600 MAX_FAILURES=3 docker compose up --build --abort-on-container-exit

# closest to the failing app: sidebar, generateMetadata, load event 150 ms later
# so the click lands inside the target's metadata-only prefetch in about 1 of 3 runs
VARIANT=v2 NEXT_VERSION=16.2.6 RUNS=600 MAX_FAILURES=3 SIDEBAR=1 LOAD_DELAY_MS=150 docker compose up --build --abort-on-container-exit

# print the probe for passing runs too
PROBE_ALWAYS=1 RUNS=8 docker compose up --abort-on-container-exit
```

Results land in `results/` (`report.json`, and `artifacts/` with a trace and `nav-probe.json` per failure).

## Measured (Docker on Linux arm64, 2 CPUs, Playwright 1.62.1, one worker)

| Next | Variant | Failures / runs |
|---|---|---|
| 16.2.6 | base | 0 / 600 |
| 16.2.6 | `SIDEBAR=1` | 0 / 600 |
| 16.2.6 | `VARIANT=v2`, `SIDEBAR=1`, `LOAD_DELAY_MS=150` | 0 / 600 |
