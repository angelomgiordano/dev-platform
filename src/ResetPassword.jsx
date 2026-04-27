import React, { useState } from "react";
import { supabase } from "./lib/supabase";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("La password deve avere almeno 6 caratteri."); return; }
    if (password !== confirm) { setError("Le password non corrispondono."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Nuova password</h1>
          <p className="text-sm text-slate-500 mt-1">Scegli una nuova password per il tuo account.</p>
        </div>

        <label className="block text-xs font-semibold text-slate-600 mb-1">Nuova password</label>
        <input type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="new-password" />

        <label className="block text-xs font-semibold text-slate-600 mb-1">Conferma password</label>
        <input type="password" required value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="new-password" />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold rounded-lg py-2 transition">
          {loading ? "Salvataggio..." : "Salva nuova password"}
        </button>
      </form>
    </div>
  );
}
