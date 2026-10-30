import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

const field =
  "mt-1 w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5";

export default async function Login({ searchParams }) {
  const { error } = await searchParams;

  async function go(fd) {
    "use server";
    if (
      await login(
        String(fd.get("username") || ""),
        String(fd.get("password") || ""),
      )
    )
      redirect("/admin");
    redirect("/admin/login?error=1");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-serif text-3xl text-pine-900">Staff sign in</h1>
      <p className="mt-2 text-sm text-ink/70">
        Use the username and password given to you by the hospital.
      </p>
      <form action={go} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-pine-800">
          Username
          <input
            name="username"
            required
            autoFocus
            autoCapitalize="none"
            className={field}
          />
        </label>
        <label className="block text-sm font-semibold text-pine-800">
          Password
          <input name="password" type="password" required className={field} />
        </label>
        {error && (
          <p role="alert" className="text-alert">
            Wrong username or password. Try again.
          </p>
        )}
        <button className="rounded-full bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700">
          Sign in
        </button>
      </form>
    </div>
  );
}
