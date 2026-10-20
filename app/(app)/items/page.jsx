import Link from "next/link";

const ROWS = Array.from({ length: 50 }, (_, i) => i + 1);

export default async function ItemsPage() {
  // ROW_PREFETCH=false at `next start` time switches the rows to prefetch={false}.
  const prefetch = process.env.ROW_PREFETCH === "false" ? false : undefined;
  return (
    <table>
      <tbody>
        {ROWS.map((id) => (
          <tr key={id}>
            <td>
              <Link data-testid={`row-${id}`} href={`/items/${id}`} prefetch={prefetch}>
                Item {id}
              </Link>
            </td>
            <td>item-{id}@example.com</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
