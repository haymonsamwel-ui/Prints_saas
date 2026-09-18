import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-8">
          <h1 className="mt-3 text-3xl font-semibold text-white">Register or sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Create your studio workspace, then use it across sales, production, payments, and delivery.</p>
        </div>

        <LoginForm />
      </section>
    </div>
  );
}
