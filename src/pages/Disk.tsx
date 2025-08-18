// src/pages/Disk.tsx
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HardDrive } from "lucide-react";
import { formatBytes } from "../utils/util";

type DiskEntry = {
  mount_point: string;
  file_system: string;
  total_space: number;     
  available_space: number; 
};

export default function Disk() {
  const [disks, setDisks] = useState<DiskEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchDisk = async () => {
      try {
        const res = await invoke<DiskEntry[]>("get_disk_info");
        if (!alive) return;
        setDisks(res);
        setError(null);
        setLastUpdated(new Date());
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to fetch disk info");
      }
    };

    fetchDisk();
    const t = setInterval(fetchDisk, 8000); 
    return () => { alive = false; clearInterval(t); };
  }, []);


  const rows = useMemo(() => {
    if (!disks) return [];
    return disks
    .map((d) => {
      const used = Math.max(0, (d.total_space ?? 0) - (d.available_space ?? 0));
      const usedPct = d.total_space ? (used / d.total_space) * 100 : 0;
      return { ...d, used, usedPct };
    
    });
  }, [disks]);

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HardDrive className="w-7 h-7 text-slate-400" /> Disks
        </h1>
        <div className="flex items-center">
          <div className="text-sm text-slate-400">
            {rows.length} disk{rows.length === 1 ? "" : "s"}
          </div>
          <div className="ml-auto text-xs text-slate-400">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleString()}</span>}
          </div>
        </div>

        {!disks && !error && <div className="mt-6 text-sm">Loading…</div>}
        {error && <div className="mt-6 text-sm text-red-300">{error}</div>}
        {disks && rows.length === 0 && !error && (
          <div className="mt-6 text-sm text-slate-400">No disks found.</div>
        )}

        {rows.length > 0 && !error && (
          <div className="mt-6 space-y-6">
            {rows.map((d, idx) => (
              <div key={`${d.mount_point}-${d.file_system}-${idx}`} className="rounded border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <th className="w-40 p-2 text-left text-slate-400">Mount Point</th>
                      <td className="p-2">{d.mount_point}</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="w-40 p-2 text-left text-slate-400">File System</th>
                      <td className="p-2">{d.file_system}</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <th className="w-40 p-2 text-left text-slate-400">Capacity</th>
                      <td className="p-2">{formatBytes(d.total_space)}</td>
                    </tr>
                    <tr>
                      <th className="w-40 p-2 text-left text-slate-400">Used / Total</th>
                      <td className="p-2">
                        <div className="text-sm">
                          {formatBytes(d.used)} / {formatBytes(d.total_space)}
                          <span className="text-slate-400"> ({d.usedPct.toFixed(1)}% used)</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-slate-200"
                            style={{ width: `${Math.max(0, Math.min(100, d.usedPct))}%` }}
                            aria-label={`Disk ${idx} usage`}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
