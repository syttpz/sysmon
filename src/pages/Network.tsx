import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Network } from "lucide-react";

type LocalIp = { ipv4?: string | null; ipv6?: string | null };
type Ipapi = {
  ip: string; city?: string; region?: string; country_name?: string; org?: string; timezone?: string;
};

export default function NetworkPage() {
  const [localIp, setLocalIp] = useState<LocalIp | null>(null);
  const [publicInfo, setPublicInfo] = useState<Ipapi | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const [local, pub] = await Promise.all([
          invoke<LocalIp>("get_local_ip"),
          fetch("https://ipapi.co/json/", { headers: { Accept: "application/json" } })
            .then(r => r.json() as Promise<Ipapi>),
        ]);
        if (!alive) return;
        setLocalIp(local);
        setPublicInfo(pub);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load network info");
      }
    })();
    return () => { alive = false; };
  }, []);

  const locationStr = publicInfo
    ? [publicInfo.city, publicInfo.region, publicInfo.country_name].filter(Boolean).join(", ")
    : "";

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Network className="h-6 w-6" /> Network
        </h1>

        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
        {!err && (!publicInfo || !localIp) && (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        )}

        {publicInfo && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-slate-300">Public</h2>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-400">Public IP</span>
              <span className="font-mono">{publicInfo.ip || "-"}</span>
            </div>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-400">Location</span>
              <span className="font-mono">{locationStr || "-"}</span>
            </div>

            {publicInfo.org && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-400">ISP / Org</span>
                <span className="font-mono">{publicInfo.org}</span>
              </div>
            )}

            {publicInfo.timezone && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-400">Timezone</span>
                <span className="font-mono">{publicInfo.timezone}</span>
              </div>
            )}
          </section>
        )}

        {localIp && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-slate-300">Local</h2>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-400">IPv4</span>
              <span className="font-mono">{localIp.ipv4 ?? "-"}</span>
            </div>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-400">IPv6</span>
              <span className="font-mono">{localIp.ipv6 ?? "-"}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
