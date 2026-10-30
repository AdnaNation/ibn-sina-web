"use client";
import { useActionState, useEffect, useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { bookAppointment } from "./actions";
import { fmtTime, fmtDate } from "@/lib/time";
import { todayDhaka } from "@/lib/time";

const field =
  "mt-1 w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5 focus:border-pine-600";
const Step = ({ n, title, done, children }) => (
  <section className="rounded-2xl border border-pine-100 bg-white p-5">
    <h2 className="flex items-center gap-3 font-semibold text-lg">
      <span
        className={`grid size-7 place-items-center rounded-full text-sm ${done ? "bg-pine-700 text-white" : "bg-pine-100 text-pine-800"}`}
      >
        {done ? <CheckCircle2 size={16} aria-hidden /> : n}
      </span>
      {title}
    </h2>
    <div className="mt-4">{children}</div>
  </section>
);

export default function AppointmentForm({ doctors, selected }) {
  const [state, action, pending] = useActionState(bookAppointment, {});
  const [q, setQ] = useState("");
  const [doctor, setDoctor] = useState(
    doctors.find((d) => d.slug === selected) || null,
  );
  const [avail, setAvail] = useState(null);
  const [date, setDate] = useState("");
  const v = state.values || {};

  useEffect(() => {
    if (!doctor) return;
    setAvail(null);
    setDate("");
    fetch(`/api/availability?doctor=${doctor.slug}`)
      .then((r) => r.json())
      .then(setAvail)
      .catch(() => setAvail([]));
  }, [doctor]);

  const matches = doctors
    .filter((d) =>
      `${d.name} ${d.department} ${d.unit}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .slice(0, 30);
  const day = avail?.find((a) => a.date === date);

  return (
    <form action={action} className="space-y-5">
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <input type="hidden" name="doctor" value={doctor?.slug || ""} />
      <input type="hidden" name="date" value={date} />

      <Step n={1} title="Choose your doctor" done={!!doctor}>
        {doctor ? (
          <p className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <strong>{doctor.name}</strong>, {doctor.department}
              <br />
              <span className="text-sm text-ink/70">
                {doctor.unit.replace("Ibn Sina ", "")}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setDoctor(null)}
              className="text-sm font-semibold text-pine-700"
            >
              Change doctor
            </button>
          </p>
        ) : (
          <>
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-3.5 text-ink/50"
                aria-hidden
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, specialty or branch"
                aria-label="Search doctors"
                className={`${field} !mt-0 pl-10`}
              />
            </label>
            <ul className="mt-3 max-h-72 overflow-auto divide-y divide-pine-100">
              {matches.map((d) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => setDoctor(d)}
                    className="w-full text-left py-3 px-2 rounded-lg hover:bg-pine-50"
                  >
                    <span className="font-semibold">{d.name}</span>
                    <span className="block text-sm text-ink/70">
                      {d.department}, {d.unit.replace("Ibn Sina ", "")}
                    </span>
                  </button>
                </li>
              ))}
              {!matches.length && (
                <li className="py-3 text-ink/70">
                  No doctor found. Try a different word.
                </li>
              )}
            </ul>
          </>
        )}
      </Step>

      {doctor && (
        <Step n={2} title="Choose a day" done={!!date}>
          {!avail ? (
            <p className="text-ink/70">Checking seats…</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {avail.map((a) => (
                <li key={a.date}>
                  <button
                    type="button"
                    disabled={!a.left}
                    onClick={() => setDate(a.date)}
                    aria-pressed={date === a.date}
                    className={`w-full rounded-xl border p-3 text-left disabled:opacity-40 ${date === a.date ? "border-pine-700 bg-pine-50 ring-2 ring-pine-700" : "border-pine-100 hover:bg-pine-50"}`}
                  >
                    <span className="block font-semibold">
                      {a.date === todayDhaka() ? "Today" : fmtDate(a.date)}
                    </span>
                    <span
                      className={`block text-sm ${a.left && a.left < 8 ? "text-alert" : "text-ink/70"}`}
                    >
                      {a.left
                        ? `${a.left} seat${a.left === 1 ? "" : "s"} left`
                        : "Full"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {day && day.left > 0 && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-pine-900 px-4 py-3 text-white"
            >
              You would be <strong>serial {day.next}</strong>, seen around{" "}
              <strong>{fmtTime(day.etaAt)}</strong>.
              {day.delayMin > 0 &&
                ` The doctor is running ${day.delayMin} min late today.`}
            </p>
          )}
        </Step>
      )}

      {doctor && date && (
        <Step n={3} title="Your details" done={false}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-pine-800">
              Patient name
              <input
                name="name"
                required
                defaultValue={v.name}
                autoComplete="name"
                className={field}
              />
            </label>
            <label className="block text-sm font-semibold text-pine-800">
              Mobile number
              <input
                name="phone"
                required
                type="tel"
                inputMode="numeric"
                defaultValue={v.phone}
                autoComplete="tel"
                placeholder="01712345678"
                className={field}
              />
            </label>
            <label className="block text-sm font-semibold text-pine-800 md:col-span-2">
              Anything we should know? (optional)
              <textarea
                name="note"
                rows={2}
                maxLength={500}
                defaultValue={v.note}
                className={field}
              />
            </label>
          </div>
          {state.error && (
            <p role="alert" className="mt-4 font-medium text-alert">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="mt-5 rounded-full bg-pine-900 px-8 py-3 font-semibold text-white hover:bg-pine-700 disabled:opacity-60"
          >
            {pending ? "Booking…" : "Confirm and get my serial"}
          </button>
        </Step>
      )}
    </form>
  );
}
