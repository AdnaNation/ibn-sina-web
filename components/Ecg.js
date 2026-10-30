const B = "h40 l8 -8 l8 8 h20 l8 6 l10 -48 l12 66 l8 -24 h24 l10 -10 l12 10";
const D = `M0 60 h100 ${B} h160 ${B} h160 ${B} h160 ${B} h120`;

export default function Ecg({ className = "" }) {
  const p = {
    d: D,
    pathLength: 100,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <svg viewBox="0 0 1340 120" className={className} aria-hidden="true">
      <path {...p} className="ecg-base" />
      <path {...p} className="ecg-pulse" />
    </svg>
  );
}
