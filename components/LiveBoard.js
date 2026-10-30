"use client";
import { useEffect, useState } from "react";
import { fmtTime } from "@/lib/time";
import Ecg from "./Ecg";

const LABEL = {
  live: "Seeing patients",
  break: "On a break",
  late: "Doctor has not arrived",
  waiting_start: "Not started",
  finished: "Session over",
};
const DOT = {
  live: "bg-emerald-400",
  break: "bg-brass",
  late: "bg-alert",
  waiting_start: "bg-pine-100",
  finished: "bg-slate-400",
};

export default function LiveBoard({ initial }) {
  const [data, setData] = useState(initial);
  const [unit, setUnit] = useState("");

  useEffect(() => {
    const tick = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/board", { cache: "no-store" });
        if (r.ok) setData(await r.json());
      } catch {}
    };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const units = [...new Set(data.sessions.map((s) => s.unit))];
  const list = data.sessions.filter((s) => !unit || s.unit === unit);

  return (
    <div className="bg-pine-950 lattice min-h-[80vh] text-white">
      <div className="px-4 py-12 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl">Live queue</h1>
            <p className="mt-2 text-pine-100">
              Today’s doctors and the serial being seen right now. Updated{" "}
              {fmtTime(data.now)}.
            </p>
            <Ecg className="h-10 mt-3 w-72 text-emerald-300" />
          </div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            aria-label="Branch"
            className="rounded-lg bg-pine-800 px-3 py-2.5 text-white border border-pine-700"
          >
            <option value="">All branches</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u.replace("Ibn Sina ", "")}
              </option>
            ))}
          </select>
        </div>

        {list.length === 0 ? (
          <p className="mt-12 text-pine-100">
            No doctor sessions are open today. Book an appointment to open one.
          </p>
        ) : (
          <ul className="grid gap-4 mt-10 md:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <li
                key={s.key}
                className="p-5 border rounded-2xl bg-pine-900 border-pine-800"
              >
                <h2 className="text-lg font-semibold leading-snug">
                  {s.doctor}
                </h2>
                <p className="text-sm text-pine-100">
                  {s.department}, {s.unit.replace("Ibn Sina ", "")}
                </p>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <p className="text-sm text-pine-100">Now serving</p>
                    <p className="font-serif text-6xl leading-none">
                      {s.current || "–"}
                    </p>
                  </div>
                  <p className="text-sm text-right text-pine-100">
                    {s.waiting} waiting
                    <br />
                    {s.lastSerial} booked
                  </p>
                </div>
                <p className="flex items-center gap-2 mt-5 text-sm">
                  <span
                    className={`size-2.5 rounded-full ${DOT[s.phase]}`}
                    aria-hidden
                  />
                  {LABEL[s.phase]}
                  {s.phase === "waiting_start" &&
                    `, starts ${fmtTime(s.startsAt)}`}
                </p>
                {s.delayMin > 0 && (
                  <p className="mt-1 text-sm text-brass-light">
                    Running {s.delayMin} min late
                  </p>
                )}
                {s.notice && (
                  <p className="mt-1 text-sm text-pine-100">{s.notice}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
