const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const metadata = { title: "Item detail" };

export default async function ItemPage({ params }) {
  const { id } = await params;
  await sleep(10);
  return (
    <section data-testid="item-page">
      <h1>Item {id}</h1>
      <p>Detail for item {id}.</p>
    </section>
  );
}
