import { cookies } from "next/headers";
import Link from "next/link";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function AppLayout({ children }) {
  // Stands in for a per-request session lookup.
  await cookies();
  await sleep(5);
  return (
    <>
      <header>
        <Link href="/">Home</Link> <Link href="/items">Items</Link>
      </header>
      <main>{children}</main>
    </>
  );
}
