"use client";

import { Building2, Eye, EyeOff, LockKeyhole, Mail, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppRole, readUsers, saveUser, signIn } from "@/lib/auth-session";
import { saveStudioProfile } from "@/lib/studio-profile";

const defaultRole: AppRole = "ADMIN";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim().toLowerCase();
        const password = String(formData.get("password") ?? "");

        if (mode === "forgot") {
          const user = readUsers().find((entry) => entry.email.toLowerCase() === email);

          if (!user) {
            setMessage("No account was found with that email address.");
            return;
          }

          setResetEmail(email);
          setMode("reset");
          setMessage("Create a new password for this account.");
          return;
        }

        if (mode === "reset") {
          const newPassword = String(formData.get("newPassword") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");
          const user = readUsers().find((entry) => entry.email.toLowerCase() === resetEmail);

          if (!user || newPassword.length < 8) {
            setMessage("Your new password must be at least 8 characters.");
            return;
          }

          if (newPassword !== confirmPassword) {
            setMessage("The passwords do not match.");
            return;
          }

          saveUser({ ...user, password: newPassword });
          setMode("login");
          setMessage("Password updated. You can now sign in.");
          return;
        }

        if (mode === "register") {
          const studioName = String(formData.get("studioName") ?? "").trim();
          const name = String(formData.get("name") ?? "").trim() || "Workspace Admin";

          if (!studioName) {
            setMessage("Studio name is required.");
            return;
          }

          const profile = saveStudioProfile({
            name: studioName,
            email: email || "hello@bkprints.co.tz",
          });

          const user = {
            email,
            password,
            companyName: profile.name,
            name,
            role: defaultRole,
            status: "Active" as const,
          };

          saveUser(user);
          signIn({
            email: user.email,
            companyName: user.companyName,
            name: user.name,
            role: user.role,
            status: user.status,
            isAuthenticated: true,
            loggedInAt: new Date().toISOString(),
          });

          setMessage(`${profile.name} is now active for this workspace.`);
          router.push("/");
          return;
        }

        const users = readUsers();
        const user = users.find((entry) => entry.email.toLowerCase() === email);

        if (!user || user.password !== password) {
          setMessage("Invalid email or password. Try the demo credentials from your workspace setup.");
          return;
        }

        signIn({
          email: user.email,
          companyName: user.companyName,
          name: user.name,
          role: user.role,
          status: user.status ?? "Active",
          isAuthenticated: true,
          loggedInAt: new Date().toISOString(),
        });

        setMessage("Signed in successfully.");
        router.push("/");
      }}
    >
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
        {[
          ["register", "Register"],
          ["login", "Sign in"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value as "login" | "register");
              setMessage("");
            }}
            className={`min-h-10 rounded-xl text-sm font-semibold transition ${
              mode === value ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "register" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Studio name</span>
            <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                name="studioName"
                placeholder="BK Prints"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Admin name</span>
            <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
              <UserCircle2 className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                name="name"
                placeholder="Jane Admin"
                required
              />
            </span>
          </label>
        </>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Email</span>
        <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
          <Mail className="h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            name="email"
            placeholder="you@company.com"
            required
            type="email"
          />
        </span>
      </label>

      {mode === "forgot" ? null : mode === "reset" ? (
        <>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">Resetting password for {resetEmail}</div>
          {[
            ["newPassword", "New password"],
            ["confirmPassword", "Confirm password"],
          ].map(([name, label]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm text-slate-300">{label}</span>
              <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
                <LockKeyhole className="h-4 w-4 text-slate-500" />
                <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" minLength={8} name={name} required type={showPassword ? "text" : "password"} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-400 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
          ))}
        </>
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
            <LockKeyhole className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" minLength={8} name="password" placeholder="Minimum 8 characters" required type={showPassword ? "text" : "password"} />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-400 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>
      )}

      {mode === "login" ? (
        <button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="text-sm text-emerald-300 hover:text-emerald-200">
          Forgot password?
        </button>
      ) : null}

      {mode === "forgot" ? (
        <button className="min-h-12 w-full rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Find account</button>
      ) : (
        <button className="min-h-12 w-full rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
          {mode === "register" ? "Create workspace" : mode === "reset" ? "Update password" : "Sign in"}
        </button>
      )}

      {mode === "forgot" || mode === "reset" ? (
        <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className="w-full text-sm text-slate-400 hover:text-white">Back to sign in</button>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}
    </form>
  );
}
