import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminNav({ p, current }) {
  const links = [
    ["Queue", "/admin/queue"],
    ...(p.role === "owner"
      ? [
          ["Overview", "/admin"],
          ["Staff accounts", "/admin/staff"],
        ]
      : []),
  ];
  return (
    <header className="border-b border-pine-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm">
          <strong>{p.name}</strong>{" "}
          <span className="text-ink/60">({p.scope})</span>
        </p>
        <nav
          className="flex items-center gap-5 text-sm font-semibold"
          aria-label="Admin"
        >
          {links.map(([l, h]) => (
            <Link
              key={h}
              href={h}
              className={
                current === h
                  ? "text-pine-900 underline underline-offset-8"
                  : "text-pine-700"
              }
            >
              {l}
            </Link>
          ))}
          <form action={logoutAction}>
            <button className="text-ink/60 hover:text-ink">Sign out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
