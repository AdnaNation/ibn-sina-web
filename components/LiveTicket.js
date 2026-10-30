"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BellRing, Clock, MapPin, Stethoscope } from "lucide-react";
import { fmtTime, fmtDate } from "@/lib/time";
import { cancelAppointment } from "@/app/track/actions";
import QueueJourney from "./QueueJourney";

const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");

export default function LiveTicket({ initial, isNew }) {
  const [t, setT] = useState(initial);
  const [alerts, setAlerts] = useState(false);
  const [pending, start] = useTransition();
  const sent = useRef({});

  const refresh = async () => {
    try {
      const r = await fetch(`/api/queue/${initial.ref}`, { cache: "no-store" });
      if (r.ok) setT(await r.json());
    } catch {}
  };

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) refresh();
    };
    const id = setInterval(tick, 8000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [initial.ref]);

  useEffect(() => {
    if (!alerts) return;
    const key =
      t.status === "serving"
        ? "now"
        : t.status === "waiting" && t.ahead <= 2
          ? "soon"
          : null;
    if (!key || sent.current[key]) return;
    sent.current[key] = true;
    navigator.vibrate?.([250, 120, 250]);
    new Notification(
      key === "now" ? "It is your turn" : "Your turn is almost here",
      {
        body:
          key === "now"
            ? `Serial ${t.serial}: please go to the room of ${t.doctor}.`
            : `${t.ahead} patient${t.ahead === 1 ? "" : "s"} ahead of serial ${t.serial}.`,
      },
    );
  }, [t, alerts]);

  async function enableAlerts() {
    if (!("Notification" in window)) return;
    setAlerts((await Notification.requestPermission()) === "granted");
  }

  const s = t.session;
  const pct =
    t.serial > 1
      ? Math.round(((t.serial - 1 - t.ahead) / (t.serial - 1)) * 100)
      : 0;
  const headline = {
    waiting:
      t.ahead === 0
        ? "You are next."
        : `${t.ahead} patient${t.ahead === 1 ? "" : "s"} ahead of you.`,
    serving: "It is your turn. Please go to the doctor’s room.",
    done: "Your visit is complete.",
    skipped: "Your serial was skipped. Please see the reception desk.",
    cancelled: "This serial was cancelled.",
  }[t.status];
  const phaseNote = {
    late: "The doctor has not started yet. Your estimate updates as soon as they do.",
    break: "The doctor is on a short break.",
    waiting_start: `The session starts at ${fmtTime(s.startsAt)}.`,
    finished: "This session has ended.",
  }[s.phase];

  return (
    <div className="space-y-5">
      {isNew && (
        <p
          role="status"
          className="rounded-xl bg-pine-50 border border-pine-100 px-4 py-3"
        >
          Booked. Save your tracking code <strong>{t.ref}</strong> or keep this
          page open.
        </p>
      )}

      <section className="rounded-3xl bg-pine-900 lattice text-white p-7">
        <p className="text-pine-100">
          Hello {t.firstName}, your serial number is
        </p>
        <p className="font-serif text-8xl leading-none mt-2">{t.serial}</p>
        <p className="mt-5 text-xl font-semibold" aria-live="polite">
          {headline}
        </p>

        {t.status === "waiting" && (
          <div
            className="mt-5"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Queue progress"
          >
            <div className="h-2 rounded-full bg-pine-800 overflow-hidden">
              <div
                className="h-full bg-brass transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-pine-100">
              Now seeing serial {s.current || "none yet"}
            </p>
          </div>
        )}
        <QueueJourney current={s.current} serial={t.serial} status={t.status} />
      </section>

      {t.status === "waiting" && t.eta && (
        <section className="rounded-2xl bg-white border border-pine-100 p-5 flex gap-4">
          <Clock className="text-pine-700 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">
              {t.eta.minutes <= 1
                ? "Your turn is about to come"
                : `About ${t.eta.minutes} min to go, around ${fmtTime(t.eta.at)}`}
            </p>
            <p className="text-sm text-ink/70 mt-1">
              {t.eta.minutes > 30
                ? `You can leave home around ${fmtTime(t.eta.comeBy)}.`
                : `Please be at the hospital by ${fmtTime(t.eta.comeBy)}.`}{" "}
              Average consultation today: {s.avgMin} min.
            </p>
          </div>
        </section>
      )}

      {(phaseNote || s.delayMin > 0 || s.notice) && (
        <section className="rounded-2xl bg-brass-light/50 border border-brass/30 p-5 text-sm space-y-1">
          {s.delayMin > 0 && (
            <p className="font-semibold">
              The doctor is running about {s.delayMin} minutes late.
            </p>
          )}
          {s.notice && <p>{s.notice}</p>}
          {phaseNote && <p>{phaseNote}</p>}
        </section>
      )}

      <section className="rounded-2xl bg-white border border-pine-100 p-5 text-sm space-y-2">
        <p className="flex gap-2">
          <Stethoscope size={16} className="mt-0.5 shrink-0" aria-hidden />{" "}
          {t.doctor}, {t.department}
        </p>
        <p className="flex gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden /> {t.unit}
        </p>
        <p>
          {fmtDate(t.date)}. Tracking code <strong>{t.ref}</strong>
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        {t.status === "waiting" && !alerts && "Notification" in globalThis && (
          <button
            onClick={enableAlerts}
            className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pine-700"
          >
            <BellRing size={16} aria-hidden /> Alert me when it is almost my
            turn
          </button>
        )}
        {alerts && (
          <p className="text-sm text-pine-700">
            Alerts are on. Keep this page open.
          </p>
        )}
        {t.status === "waiting" && (
          <button
            disabled={pending}
            onClick={() =>
              confirm("Cancel this serial?") &&
              start(async () => {
                await cancelAppointment(t.ref);
                await refresh();
              })
            }
            className="rounded-full border border-alert px-5 py-2.5 text-sm font-semibold text-alert hover:bg-red-50 disabled:opacity-60"
          >
            Cancel my serial
          </button>
        )}

        {/* 3. inside the buttons <div>, before the "See the live board" link */}
        {t.status === "waiting" && t.eta && (
          <a
            download="ibn-sina-appointment.ics"
            href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
              [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "BEGIN:VEVENT",
                `DTSTART:${stamp(t.eta.comeBy)}`,
                `DTEND:${stamp(t.eta.at + 30 * 60000)}`,
                `SUMMARY:Ibn Sina: ${t.doctor} (serial ${t.serial})`,
                `DESCRIPTION:Tracking code ${t.ref}`,
                "END:VEVENT",
                "END:VCALENDAR",
              ].join("\r\n"),
            )}`}
            className="rounded-full border border-pine-700 px-5 py-2.5 text-sm font-semibold text-pine-800 hover:bg-pine-50"
          >
            Add to calendar
          </a>
        )}
        <Link
          href="/live"
          className="rounded-full border border-pine-700 px-5 py-2.5 text-sm font-semibold text-pine-800 hover:bg-pine-50"
        >
          See the live board
        </Link>
      </div>
    </div>
  );
}
