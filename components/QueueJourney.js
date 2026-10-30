const range = (a, b) =>
  Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

export default function QueueJourney({ current, serial, status }) {
  if (status !== "waiting") return null;
  const nums =
    serial - current <= 7
      ? range(Math.max(1, current - 1), serial)
      : [current - 1, current, current + 1, "…", serial - 1, serial].filter(
          (n) => n === "…" || n >= 1,
        );

  return (
    <ol
      className="mt-6 flex items-start gap-2 overflow-x-auto pb-1"
      aria-label="Queue positions"
    >
      {nums.map((n, i) => {
        if (n === "…")
          return (
            <li key={i} className="self-center text-pine-100">
              …
            </li>
          );
        const you = n === serial,
          now = n === current;
        const style = you
          ? "bg-white text-pine-900 font-bold ring-4 ring-brass"
          : now
            ? "bg-brass text-pine-950 font-bold animate-pulse"
            : n < current
              ? "bg-pine-700 text-pine-100"
              : "border border-pine-600 text-pine-100";
        return (
          <li
            key={n}
            className="flex w-12 shrink-0 flex-col items-center gap-1"
          >
            <span
              className={`grid size-11 place-items-center rounded-full ${style}`}
            >
              {n}
            </span>
            <span className="text-[11px] text-pine-100">
              {you ? "You" : now ? "Now" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
