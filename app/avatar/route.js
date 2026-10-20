// A 1x1 PNG answered after LOAD_DELAY_MS. An <img> pointing here holds back the
// window load event (and Playwright's click) without delaying hydration.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export const dynamic = "force-dynamic";

export async function GET() {
  const ms = Number(process.env.LOAD_DELAY_MS || 0);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  return new Response(PNG, { headers: { "content-type": "image/png", "cache-control": "no-store" } });
}
