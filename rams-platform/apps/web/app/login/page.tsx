"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("student@msrit.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-slate-50 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary">
            <BookOpen className="h-10 w-10" />
            <span className="text-3xl font-serif font-bold">RAMS</span>
          </Link>
          <p className="text-slate-500 mt-2">Sign in with your MSRIT account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder="you@msrit.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>

          <div className="text-xs text-slate-400 border-t pt-4 space-y-1">
            <p>Demo accounts (password: password123):</p>
            <p>student@msrit.edu · librarian@msrit.edu · admin@msrit.edu</p>
          </div>
        </form>
      </div>
    </div>
  );
}
