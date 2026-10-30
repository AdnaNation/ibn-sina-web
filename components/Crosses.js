const items = [
  [6, 62, 14, 0],
  [20, 22, 10, 2],
  [44, 74, 12, 4],
  [66, 16, 16, 1],
  [82, 58, 10, 3],
  [94, 30, 12, 5],
];

export default function Crosses() {
  return (
    <>
      {items.map(([x, y, s, d], i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="absolute plus text-white/20"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: s * 2,
            height: s * 2,
            animationDelay: `${d}s`,
          }}
        >
          <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}
