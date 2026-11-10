export function formatDuration(value, lang = "en") {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) return "";
  const total = Math.floor(minutes);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  const number = (n) =>
    new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
      useGrouping: false,
    }).format(n);

  if (lang === "bn") {
    if (hours && remainder) return `${number(hours)} ঘণ্টা ${number(remainder)} মিনিট`;
    if (hours) return `${number(hours)} ঘণ্টা`;
    return `${number(remainder)} মিনিট`;
  }

  if (hours && remainder) return `${number(hours)} hour${hours === 1 ? "" : "s"} and ${number(remainder)} min`;
  if (hours) return `${number(hours)} hour${hours === 1 ? "" : "s"}`;
  return `${number(remainder)} min`;
}
