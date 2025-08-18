// src/pages/Network.tsx
import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import axios from "axios";
import { Globe, Network } from "lucide-react";

type LocalIp = {
  ipv4?: string | null;
  ipv6?: string | null;
};

// 对应 ipapi.co/json 返回的字段（只列常用，其他自动忽略）
type Ipapi = {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  asn?: string;
  org?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  postal?: string;
};

export default function NetworkPage() {
  const [localIp, setLocalIp] = useState<LocalIp | null>(null);
  const [publicInfo, setPublicInfo] = useState<Ipapi | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    const res = await invoke<LocalIp>("get_local_ip");
    setLocalIp(res);
  }, []);

  const loadPublic = useCallback(async () => {
    const { data } = await axios.get<Ipapi>("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
    });
    setPublicInfo(data);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setErr(null);
      await Promise.all([loadLocal(), loadPublic()]);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } 
  }, [loadLocal, loadPublic]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6" />
            Network
          </h1>
        </header>

        {err && (
          <div className="mb-4 rounded-lg border border-red-700/60 bg-red-900/30 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        {/* 公网信息（ipapi.co） */}
        <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-medium">Public IP & Region</h2>
          </div>

          {!publicInfo ? (
            <p className="text-slate-400 text-sm">Loading public info…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400">Public IP</div>
                <div className="font-mono">{publicInfo.ip ?? "-"}</div>
              </div>
              <div>
                <div className="text-slate-400">Location</div>
                <div>
                  {[publicInfo.city, publicInfo.region, publicInfo.country_name]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
              </div>
              {(publicInfo.asn || publicInfo.org) && (
                <div>
                  <div className="text-slate-400">ASN / Org</div>
                  <div className="truncate">
                    {publicInfo.asn ? `${publicInfo.asn} ` : ""}
                    {publicInfo.org ?? ""}
                  </div>
                </div>
              )}
              {publicInfo.timezone && (
                <div>
                  <div className="text-slate-400">Timezone</div>
                  <div>{publicInfo.timezone}</div>
                </div>
              )}
              {(publicInfo.latitude !== undefined || publicInfo.longitude !== undefined) && (
                <div>
                  <div className="text-slate-400">Lat, Lon</div>
                  <div className="font-mono">
                    {publicInfo.latitude ?? "-"}, {publicInfo.longitude ?? "-"}
                  </div>
                </div>
              )}
              {publicInfo.postal && (
                <div>
                  <div className="text-slate-400">Postal Code</div>
                  <div className="font-mono">{publicInfo.postal}</div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 本机 IP（local-ip-address） */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-3 text-lg font-medium">Local IP</h2>
          {!localIp ? (
            <p className="text-slate-400 text-sm">Loading local IP…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400">IPv4</div>
                <div className="font-mono">{localIp.ipv4 ?? "-"}</div>
              </div>
              <div>
                <div className="text-slate-400">IPv6</div>
                <div className="font-mono">{localIp.ipv6 ?? "-"}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
