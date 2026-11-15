export function formatDuration(value, lang = "en") {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) return "";
  const total = Math.floor(minutes);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const remainder = total % 60;
  const number = (n) =>
    new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
      useGrouping: false,
    }).format(n);

  if (lang === "bn") {
    if (days) {
      return [`${number(days)} দিন`, hours ? `${number(hours)} ঘণ্টা` : "", remainder ? `${number(remainder)} মিনিট` : ""].filter(Boolean).join(" ");
    }
    if (hours && remainder) return `${number(hours)} ঘণ্টা ${number(remainder)} মিনিট`;
    if (hours) return `${number(hours)} ঘণ্টা`;
    return `${number(remainder)} মিনিট`;
  }

  if (days) {
    return [`${number(days)} day${days === 1 ? "" : "s"}`, hours ? `${number(hours)} hour${hours === 1 ? "" : "s"}` : "", remainder ? `${number(remainder)} min` : ""].filter(Boolean).join(" and ");
  }
  if (hours && remainder) return `${number(hours)} hour${hours === 1 ? "" : "s"} and ${number(remainder)} min`;
  if (hours) return `${number(hours)} hour${hours === 1 ? "" : "s"}`;
  return `${number(remainder)} min`;
}
