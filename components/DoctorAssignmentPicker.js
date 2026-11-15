"use client";

import { useMemo, useState } from "react";

export default function DoctorAssignmentPicker({
  doctors = [],
  initialSelected = [],
  initialAllDoctors = false,
  allDoctorsLabel,
  selectAllLabel,
  assignedLabel,
  futureHelp,
}) {
  const doctorSlugs = useMemo(() => doctors.map((doctor) => doctor.slug), [doctors]);
  const [selected, setSelected] = useState(() => new Set(initialSelected));
  const [allDoctors, setAllDoctors] = useState(initialAllDoctors);
  const allCurrentSelected = doctorSlugs.length > 0 && doctorSlugs.every((slug) => selected.has(slug));

  function toggleAllCurrent(checked) {
    setSelected(checked ? new Set(doctorSlugs) : new Set());
  }

  function toggleDoctor(slug, checked) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-pine-100 bg-white p-4">
      <label className="flex items-start gap-2 text-sm font-bold text-pine-900">
        <input
          type="checkbox"
          name="allDoctors"
          value="yes"
          checked={allDoctors}
          onChange={(event) => setAllDoctors(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-emerald-700"
        />
        <span>{allDoctorsLabel}<span className="mt-0.5 block text-xs font-normal text-ink/60">{futureHelp}</span></span>
      </label>

      <div className="mt-4 border-t border-pine-100 pt-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-pine-800">
          <input
            type="checkbox"
            checked={allCurrentSelected}
            onChange={(event) => toggleAllCurrent(event.target.checked)}
            className="size-4 accent-emerald-700"
          />
          {selectAllLabel}
        </label>
        <p className="mb-2 mt-1 text-xs text-ink/60">{assignedLabel}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <label key={doctor.slug} className="flex min-w-0 items-start gap-2 rounded-lg border border-pine-100 bg-pine-50/40 px-3 py-2.5 text-sm text-pine-900">
              <input
                type="checkbox"
                name="doctorSlugs"
                value={doctor.slug}
                checked={selected.has(doctor.slug)}
                onChange={(event) => toggleDoctor(doctor.slug, event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-emerald-700"
              />
              <span className="min-w-0"><strong className="block break-words">{doctor.name}</strong><span className="text-xs text-ink/60">{doctor.department}</span></span>
            </label>
          ))}
          {!doctors.length && <p className="text-sm text-ink/60">No doctors are available in this branch yet.</p>}
        </div>
      </div>
    </div>
  );
}
