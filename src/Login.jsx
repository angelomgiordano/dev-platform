import React, { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage("Email inviata! Controlla la tua casella e clicca il link per reimpostare la password.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={mode === "login" ? handleLogin : handleForgot}
        className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8 border border-slate-200"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">RelyAssets</h1>
          <p className="text-sm text-slate-500 mt-1">BESS Development Platform</p>
        </div>

        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="email"
        />

        {mode === "login" && (
          <>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold rounded-lg py-2 transition"
        >
          {loading
            ? (mode === "login" ? "Accesso in corso..." : "Invio email...")
            : (mode === "login" ? "Accedi" : "Invia link di recupero")}
        </button>

        <div className="mt-4 text-center">
          {mode === "login" ? (
            <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
              className="text-sm text-blue-600 hover:underline">
              Password dimenticata?
            </button>
          ) : (
            <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              className="text-sm text-blue-600 hover:underline">
              Torna al login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
