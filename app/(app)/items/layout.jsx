import Link from "next/link";
import { connection } from "next/server";

import { RouteKey } from "../../components/route-key";

export const dynamic = "force-dynamic";

const SECTIONS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

export default async function ItemsLayout({ children }) {
  await connection();
  // SIDEBAR=1 at `next start` time adds a sidebar of 12 prefetched links.
  const sidebar = process.env.SIDEBAR === "1";
  return (
    <div data-testid="items-shell">
      <RouteKey />
      {/* LOAD_DELAY_MS > 0: the avatar holds back the load event by that much. */}
      {Number(process.env.LOAD_DELAY_MS || 0) > 0 ? <img src="/avatar" alt="" width={1} height={1} /> : null}
      {sidebar ? (
        <nav>
          {SECTIONS.map((s) => (
            <Link key={s} href={`/sections/${s}`}>
              Section {s}
            </Link>
          ))}
        </nav>
      ) : null}
      {children}
    </div>
  );
}
