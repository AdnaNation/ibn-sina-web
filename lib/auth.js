import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { verifyStaff } from "./staff";

const COOKIE = "ist_session";
const sig = (v) =>
  createHmac("sha256", process.env.ADMIN_SECRET || "")
    .update(v)
    .digest("base64url");
const same = (a, b) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function getSession() {
  if (!process.env.ADMIN_SECRET) return null;
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return null;
  const [body, s] = c.split(".");
  if (!s || !same(sig(body), s)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

export async function login(username, password) {
  if (!process.env.ADMIN_SECRET) return false;
  const u = username.trim().toLowerCase();
  let user = null;
  if (u === "admin") {
    const owner = process.env.ADMIN_PASSWORD;
    if (owner && same(sig(password), sig(owner)))
      user = { u, name: "Owner", role: "owner", scope: "All branches" };
  } else {
    user = await verifyStaff(u, password);
  }
  if (!user) return false;
  const body = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + 10 * 3600e3 }),
  ).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sig(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 3600,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

/* Who may touch what */
export const canSee = (p, s) =>
  p.role === "owner" ||
  (p.role === "branch" && s.unit === p.unit) ||
  (p.role === "doctor" && s.doctorSlug === p.doctorSlug);

export const canDoctor = (p, d) =>
  p.role === "owner" ||
  (p.role === "branch" && d.unit === p.unit) ||
  (p.role === "doctor" && d.slug === p.doctorSlug);
