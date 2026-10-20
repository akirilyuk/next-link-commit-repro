const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function generateMetadata({ params }) {
  const { id } = await params;
  await sleep(5);
  return { title: `Item ${id}` };
}

// About 10 KB of RSC payload, like the app where this was found.
const ROWS = Array.from({ length: 60 }, (_, i) => i);

export default async function ItemPage({ params }) {
  const { id } = await params;
  await sleep(10);
  return (
    <section data-testid="item-page">
      <h1>Item {id}</h1>
      <ul>
        {ROWS.map((i) => (
          <li key={i}>
            Membership {i} of item {id}: organisation-{i}, role member, joined 2026-01-{String((i % 28) + 1).padStart(2, "0")}
          </li>
        ))}
      </ul>
    </section>
  );
}
