export default async function SectionPage({ params }) {
  const { name } = await params;
  return <h1>Section {name}</h1>;
}
