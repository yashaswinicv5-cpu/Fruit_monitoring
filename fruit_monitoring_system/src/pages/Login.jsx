import { useState } from "react";
import { signInLocal, signUpLocal, resetPasswordLocal } from "../services/localAuth";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const simpleEmailValid = (e) => e && e.indexOf("@") !== -1 && e.indexOf(".") !== -1;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");

    if (!simpleEmailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const result = mode === "signin"
        ? await signInLocal(email, password)
        : await signUpLocal(email, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetError("");
    if (!simpleEmailValid(resetEmail)) {
      setResetError("Please enter a valid email.");
      return;
    }
    if (!resetPassword || resetPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordLocal(resetEmail, resetPassword);
      const result = await signInLocal(resetEmail, resetPassword);
      onLogin(result.user);
    } catch (err) {
      setResetError(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">Fruit Monitor Login</h1>
        <p className="text-gray-400 mb-6">Simple local signup/signin for development.</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={"flex-1 rounded-2xl px-4 py-2 text-sm font-semibold " + (mode === "signin" ? "bg-blue-600" : "bg-gray-800")}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={"flex-1 rounded-2xl px-4 py-2 text-sm font-semibold " + (mode === "signup" ? "bg-blue-600" : "bg-gray-800")}
          >
            Create Account
          </button>
        </div>

        {showReset ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-300">Email</span>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">New Password</span>
              <input
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                type="password"
                placeholder="New password"
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            {resetError ? <p className="text-sm text-red-400">{resetError}</p> : null}

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-white font-semibold"
              >
                Reset Password
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 rounded-2xl bg-gray-800 px-4 py-3 text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="text-sm text-gray-300">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold"
              >
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(email); }}
                className="text-sm text-gray-400 underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
