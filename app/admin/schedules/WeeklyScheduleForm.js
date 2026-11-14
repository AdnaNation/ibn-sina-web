"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveWeeklyScheduleAction } from "./actions";

const field = "mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-pine-500 focus:ring-2 focus:ring-pine-100";

export default function WeeklyScheduleForm({ doctors, minDate }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await saveWeeklyScheduleAction(data);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Weekly availability saved. The schedule list has been updated.");
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="block text-sm font-semibold text-pine-900">Doctor
        <select name="doctorSlug" required defaultValue="" className={field}>
          <option value="" disabled>Select a doctor</option>
          {doctors.map((doctor) => <option key={doctor.slug} value={doctor.slug}>{doctor.name} · {doctor.department} · {doctor.unit}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold text-pine-900">Start time
          <input name="weeklyStartTime" type="time" defaultValue="14:00" required className={field}/>
        </label>
        <label className="block text-sm font-semibold text-pine-900">End time
          <input name="weeklyEndTime" type="time" defaultValue="20:00" required className={field}/>
        </label>
      </div>
      <fieldset className="md:col-span-2">
        <legend className="text-sm font-semibold text-pine-900">Available weekdays</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day,index) => (
            <label key={day} className="flex cursor-pointer items-center gap-2 rounded-xl border border-pine-100 bg-white px-3 py-2 text-sm">
              <input type="checkbox" name="weekdays" value={index} className="accent-emerald-700"/>
              {day}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold text-pine-900">Serial capacity per day
          <input name="weeklyMaxPatients" type="number" min="1" max="200" defaultValue="40" required className={field}/>
        </label>
        <label className="block text-sm font-semibold text-pine-900">Average minutes / patient
          <input name="weeklyAvgMin" type="number" min="3" max="45" defaultValue="8" required className={field}/>
        </label>
      </div>
      <label className="block text-sm font-semibold text-pine-900">Optional schedule end date
        <input name="endsOn" type="date" min={minDate} className={field}/>
        <span className="mt-1 block text-xs font-normal text-ink/55">Leave empty to repeat until an administrator changes or disables it.</span>
      </label>
      <div className="flex items-end">
        <button disabled={isPending} className="w-full rounded-full bg-emerald-800 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
          {isPending ? "Saving…" : "Save weekly availability"}
        </button>
      </div>
      {message && <p role={message.includes("saved") ? "status" : "alert"} className={`md:col-span-2 rounded-xl px-4 py-3 text-sm ${message.includes("saved") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{message}</p>}
    </form>
  );
}
