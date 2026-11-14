"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
export default function AdminActionForm({ action, children, className, encType, successMessage = "Changes saved.", pendingMessage = "Saving…", resetOnSuccess = false }) {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();
  function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const buttons = [...form.querySelectorAll('button[type="submit"], button:not([type])')];
    const previousDisabled = buttons.map((button) => button.disabled);
    buttons.forEach((button) => { button.disabled = true; });
    setResult(null);
    startTransition(async () => {
      try {
        const response = await action(data);
        if (response?.error) setResult({ error: response.error });
        else {
          setResult({ success: true, value: response?.value || "" });
          if (resetOnSuccess) form.reset();
          router.refresh();
        }
      } catch (error) {
        setResult({ error: error?.message || "The action could not be completed. Please try again." });
      } finally {
        buttons.forEach((button, index) => { button.disabled = previousDisabled[index]; });
      }
    });
  }
  return <form onSubmit={handleSubmit} className={className} encType={encType} aria-busy={pending}>
    {pending && <p role="status" aria-live="polite" className="mb-3 rounded-lg bg-pine-50 px-3 py-2 text-sm font-medium text-pine-800">{pendingMessage}</p>}
    {result?.error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{result.error}</p>}
    {result?.success && <p role="status" className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{successMessage}{result.value ? <> <span className="font-mono font-semibold">{result.value}</span></> : null}</p>}
    {children}
  </form>;
}
