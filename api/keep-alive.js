// Vercel Serverless Function — pings Supabase to prevent free-tier pause.
// Triggered by Vercel Cron (see vercel.json) every 5 days.

export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Missing Supabase env vars" });
  }

  try {
    const response = await fetch(`${url}/rest/v1/projects?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const status = response.status;
    return res.status(200).json({ ok: true, supabaseStatus: status, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
