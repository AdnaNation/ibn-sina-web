import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AutoRefresh from "@/components/AutoRefresh";
import { getAdmin } from "@/lib/adminT";
import { getSession, canDoctor, hasPermission } from "@/lib/auth";
import { getConsole } from "@/lib/queue";
import { getAllDoctors } from "@/lib/data";
import { todayDhaka } from "@/lib/time";
import * as A from "./actions";

export const dynamic = "force-dynamic";

const T = {
  go: "bg-emerald-700 text-white hover:bg-emerald-800",
  plain: "border border-pine-700 text-pine-800 hover:bg-pine-50",
  warn: "border border-alert text-alert hover:bg-red-50",
};
const Btn = ({ children, t = "plain", big, ...r }) => (
  <button
    {...r}
    className={`rounded-full font-semibold disabled:opacity-40 ${big ? "px-8 py-4 text-lg" : "px-4 py-2 text-sm"} ${T[t]}`}
  >
    {children}
  </button>
);
const Key = ({ k }) => <input type="hidden" name="key" value={k} />;
const input = "rounded-lg border border-pine-100 bg-white px-3 py-2 text-sm";
const WORD = {
  waiting: "Waiting",
  serving: "With doctor",
  done: "Seen",
  skipped: "Did not come",
  cancelled: "Cancelled",
};
const CHIP = {
  waiting: "bg-pine-50",
  serving: "bg-brass-light",
  done: "bg-pine-100 text-ink/60",
  skipped: "bg-red-100",
  cancelled: "bg-slate-100 text-ink/60",
};

export default async function QueueConsole({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "queue.manage")) redirect("/admin/login");
  const canViewPatients = hasPermission(p, "patients.view");
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date || "")
    ? sp.date
    : todayDhaka();
  const [sessions, doctors] = await Promise.all([
    getConsole(date, p),
    getAllDoctors(),
  ]);
  const s = sessions.find((x) => x.doctorSlug === sp.doc) || sessions[0];
  const idle = doctors.filter(
    (d) => canDoctor(p, d) && !sessions.some((x) => x.doctorSlug === d.slug),
  );

  const find = (sp.find || "").toLowerCase();
  const patients = s
    ? s.patients.filter(
        (x) =>
          !find || `${x.name} ${canViewPatients ? x.phone : ""} ${x.ref}`.toLowerCase().includes(find),
      )
    : [];
  const serving = s?.patients.find((x) => x.status === "serving");
  const waiting = s
    ? s.patients.filter((x) => x.status === "waiting").length
    : 0;
  const over = s?.status === "finished";

  return (
    <>
      <AdminNav p={p} current="/admin/queue" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <AutoRefresh every={10000} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-pine-900">
              {date === todayDhaka() ? tr("Today’s queue") : `Queue for ${date}`}
            </h1>
            <p className="text-sm text-ink/70">
              {tr("This page updates by itself every few seconds.")}
            </p>
          </div>
          <form className="flex gap-2">
            <input
              type="date"
              name="date"
              defaultValue={date}
              aria-label={tr("Date")}
              className={input}
            />
            <Btn>{tr("Show")}</Btn>
          </form>
        </div>

        {sp.err && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{sp.err}</p>}

        {sessions.length > 1 && (
          <nav className="mt-6 flex flex-wrap gap-2" aria-label={tr("Doctors")}>
            {sessions.map((x) => (
              <Link
                key={x.key}
                href={`/admin/queue?date=${date}&doc=${x.doctorSlug}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${x.key === s.key ? "bg-pine-900 text-white" : "border border-pine-100 bg-white hover:bg-pine-50"}`}
              >
                {x.doctorName}
              </Link>
            ))}
          </nav>
        )}

        {!s && (
          <p className="mt-8 rounded-2xl bg-pine-50 p-6">
            {tr("No queue is open for this date yet. Start one below, or it opens by itself when the first patient books.")}
          </p>
        )}

        {s && (
          <section className="mt-6 rounded-3xl border border-pine-100 bg-white p-6">
            <h2 className="text-xl font-semibold">
              {s.doctorName}{" "}
              <span className="font-normal text-ink/60">· {s.department}</span>
            </h2>

            <div className="mt-5 grid items-center gap-6 md:grid-cols-[auto_1fr]">
              <div className="rounded-2xl bg-pine-900 px-10 py-6 text-center text-white">
                <p className="text-sm text-pine-100">{tr("With the doctor now")}</p>
                <p className="font-serif text-7xl leading-none">
                  {serving?.serial || "–"}
                </p>
                <p className="mt-2 text-sm text-pine-100">
                  {serving ? serving.name : `${waiting} waiting`}
                </p>
              </div>

              {over ? (
                <p className="text-lg">{tr("This queue has ended for the day.")}</p>
              ) : (
                <div>
                  <form action={A.callNext}>
                    <Key k={s.key} />
                    <Btn t="go" big disabled={!serving && waiting === 0}>
                      {serving
                        ? waiting
                          ? tr("Finish this patient and call next")
                          : tr("Finish this patient")
                        : tr("Call next patient")}
                    </Btn>
                  </form>
                  <p className="mt-2 text-sm text-ink/70">
                    {waiting} patient{waiting === 1 ? " is" : "s are"} waiting.
                    Patients see the change on their phones straight away.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {serving && (
                      <form action={A.skipCurrent}>
                        <Key k={s.key} />
                        <Btn
                          t="warn"
                          title={tr("Use this if the patient did not come when called")}
                        >
                          {tr("Patient did not come")}
                        </Btn>
                      </form>
                    )}
                    {s.status === "in_progress" && (
                      <form action={A.setStatus}>
                        <Key k={s.key} />
                        <input type="hidden" name="status" value="break" />
                        <Btn>{tr("Doctor is on a break")}</Btn>
                      </form>
                    )}
                    {s.status === "break" && (
                      <form action={A.setStatus}>
                        <Key k={s.key} />
                        <input
                          type="hidden"
                          name="status"
                          value="in_progress"
                        />
                        <Btn t="go">{tr("Doctor is back")}</Btn>
                      </form>
                    )}
                    {s.status === "scheduled" && (
                      <form action={A.setStatus}>
                        <Key k={s.key} />
                        <input
                          type="hidden"
                          name="status"
                          value="in_progress"
                        />
                        <Btn t="go">{tr("Doctor has arrived")}</Btn>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!over && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-pine-50 p-4">
                  <h3 className="font-semibold">{tr("Is the doctor late?")}</h3>
                  <p className="text-sm text-ink/70">
                    {tr("Tap one. Every waiting patient sees it and their time estimate updates.")}
                  </p>
                  <form action={A.setDelay} className="mt-3 space-y-3">
                    <Key k={s.key} />
                    <input
                      name="notice"
                      maxLength={140}
                      defaultValue={s.notice}
                      placeholder={tr("Optional message, e.g. Doctor is in surgery")}
                      aria-label={tr("Message for patients")}
                      className={`${input} w-full`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        [0, tr("On time")],
                        [15, "15 min late"],
                        [30, "30 min late"],
                        [60, "1 hour late"],
                      ].map(([m, l]) => (
                        <Btn
                          key={m}
                          name="delayMin"
                          value={m}
                          t={s.delayMin === m ? "go" : "plain"}
                        >
                          {l}
                        </Btn>
                      ))}
                    </div>
                  </form>
                </div>

                <div className="rounded-2xl bg-pine-50 p-4">
                  <h3 className="font-semibold">
                    {tr("Patient came without booking?")}
                  </h3>
                  <p className="text-sm text-ink/70">
                    {tr("Add them here and they get the next serial.")}
                  </p>
                  <form
                    action={A.addWalkIn}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <input
                      type="hidden"
                      name="doctorSlug"
                      value={s.doctorSlug}
                    />
                    <input type="hidden" name="date" value={s.date} />
                    <input
                      name="name"
                      required
                      placeholder={tr("Patient name")}
                      aria-label={tr("Patient name")}
                      className={`${input} flex-1 min-w-32`}
                    />
                    <input
                      name="phone"
                      placeholder={tr("Mobile (optional)")}
                      aria-label={tr("Mobile")}
                      className={`${input} w-40`}
                    />
                    <Btn>{tr("Add")}</Btn>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">
                All patients ({s.patients.length})
              </h3>
              <form className="flex gap-2">
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="doc" value={s.doctorSlug} />
                <input
                  name="find"
                  defaultValue={sp.find || ""}
                  placeholder={canViewPatients ? tr("Find by name, phone or code") : tr("Find by name or tracking code")}
                  aria-label={tr("Find a patient")}
                  className={input}
                />
                <Btn>{tr("Find")}</Btn>
              </form>
            </div>
            <ul className="mt-3 divide-y divide-pine-100">
              {patients.map((x) => (
                <li key={x.ref} className="flex items-center gap-4 py-3">
                  <span className="w-12 font-serif text-2xl">{x.serial}</span>
                  <span className="flex-1">
                    <strong>{x.name}</strong>
                    {x.walkIn && (
                      <span className="ml-2 text-xs text-ink/60">{tr("walk-in")}</span>
                    )}
                    <span className="block text-sm text-ink/60">
                      {canViewPatients ? (x.phone || tr("no phone")) : tr("contact details restricted")} · {x.ref}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${CHIP[x.status]}`}
                  >
                    {tr(WORD[x.status])}
                  </span>
                  {x.status === "skipped" && !over && (
                    <form action={A.recallPatient}>
                      <input type="hidden" name="ref" value={x.ref} />
                      <Btn>{tr("Call again")}</Btn>
                    </form>
                  )}
                </li>
              ))}
              {!patients.length && (
                <li className="py-4 text-ink/70">
                  {find
                    ? tr("No patient matches your search.")
                    : tr("No patients yet.")}
                </li>
              )}
            </ul>

            {!over && (
              <details className="mt-6 text-sm">
                <summary className="cursor-pointer font-semibold text-pine-800">
                  {tr("More options")}
                </summary>
                <div className="mt-3 flex flex-wrap items-end gap-6">
                  <form
                    action={A.saveSettings}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <Key k={s.key} />
                    <label>
                      {tr("Starts at")}
                      <input
                        name="startTime"
                        type="time"
                        defaultValue={s.startTime}
                        className={`${input} ml-2`}
                      />
                    </label>
                    <label>
                      {tr("Seats")}
                      <input
                        name="maxPatients"
                        type="number"
                        min={s.lastSerial || 1}
                        max="200"
                        defaultValue={s.maxPatients}
                        className={`${input} ml-2 w-24`}
                      />
                    </label>
                    <Btn>{tr("Save")}</Btn>
                  </form>
                  <form action={A.finishSession}>
                    <Key k={s.key} />
                    <Btn t="warn">{tr("End today’s queue")}</Btn>
                  </form>
                </div>
              </details>
            )}
          </section>
        )}

        {idle.length > 0 && (
          <section className="mt-8">
            <h2 className="font-semibold">{tr("Start a queue for another doctor")}</h2>
            <form
              action={A.openNew}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="date" value={date} />
              <select
                name="doctorSlug"
                required
                aria-label={tr("Doctor")}
                className={input}
              >
                {idle.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}, {d.department}
                  </option>
                ))}
              </select>
              <Btn t="go">{tr("Start queue")}</Btn>
            </form>
          </section>
        )}

        <details className="mt-10 text-sm">
          <summary className="cursor-pointer font-semibold text-pine-800">
            {tr("How this works")}
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/80">
            <li>{tr("Patients book online and get a serial number.")}</li>
            <li>
              {tr("When the doctor is ready, press")} <strong>{tr("Call next patient")}</strong>
              .
            </li>
            <li>
              {tr("If the doctor is late, tap how late. Patients are told, so they don’t wait at the hospital.")}
            </li>
          </ol>
        </details>
      </div>
    </>
  );
}
