import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./Login";
import App from "./App.jsx";

export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Caricamento…
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="relative">
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed top-3 right-4 z-50 text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg px-3 py-1.5 shadow-sm"
        title={session.user.email}
      >
        Esci ({session.user.email})
      </button>
      <App />
    </div>
  );
}
