"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "ibnsina:doctors:selected-branch";

export default function BranchPreference({
  branch,
  branches,
  q,
  department,
  anyBranch,
  branchLabel,
  fieldClassName,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState(branch);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!branch && saved && branches.includes(saved)) {
        setSelected(saved);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (department) params.set("department", department);
        params.set("branch", saved);
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else if (branch && branches.includes(branch)) {
        window.localStorage.setItem(STORAGE_KEY, branch);
      }
    } catch {
      // The directory remains usable when browser storage is unavailable.
    }
  }, [branch, branches, department, pathname, q, router]);

  function handleChange(event) {
    const value = event.target.value;
    setSelected(value);
    try {
      if (value) window.localStorage.setItem(STORAGE_KEY, value);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Continue with the in-page filter even if storage is unavailable.
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (department) params.set("department", department);
    if (value) params.set("branch", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {branchLabel}
      </span>
      <select
        name="branch"
        value={selected}
        onChange={handleChange}
        aria-label={branchLabel}
        className={fieldClassName}
      >
        <option value="">{anyBranch}</option>
        {branches.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
