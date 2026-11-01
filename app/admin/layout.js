// Staff area: never indexed by search engines, and it does not use the public header/footer.
export const metadata = {
  title: { default: "Staff portal | Ibn Sina Trust", template: "%s | Ibn Sina Staff" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-[#f3f7f5] text-ink">{children}</div>;
}
