import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HardDrive } from "lucide-react";
import { formatBytes } from "../utils/util";

type DiskEntry = {
  mount_point: string;
  file_system: string;
  total_space: number;
  available_space: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export default function Disk() {
  const [disks, setDisks] = useState<DiskEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const fetchDisk = async () => {
      try {
        const res = await invoke<DiskEntry[]>("get_disk_info");
        if (!alive) return;
        setDisks(res);
        setError(null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to fetch disk info");
      }
    };

    fetchDisk();
    const t = setInterval(fetchDisk, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const rows = (disks ?? []).map((d) => {
    const total = d.total_space || 0;
    const used = Math.max(0, total - (d.available_space || 0));
    const usedPct = total ? (used / total) * 100 : 0;
    return { ...d, used, usedPct };
  });

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HardDrive className="h-6 w-6" /> Disks
        </h1>

        {!disks && !error && <p className="mt-4 text-sm text-slate-400">Loading…</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {disks && rows.length === 0 && !error && (
          <p className="mt-4 text-sm text-slate-400">No disks found.</p>
        )}

        {rows.length > 0 && !error && (
          <div className="mt-6 space-y-6">
            
            {rows.map((d, idx) => (
              <section key={`${d.mount_point}-${d.file_system}-${idx}`}>
                <table className="w-full text-sm">
                  <tbody className="[&>tr>th]:text-slate-400 [&>tr>th]:font-normal [&>tr>th]:text-left [&>tr>th]:pr-4 [&>tr>*]:py-1 [&>tr>td]:font-mono">
                    <tr><th className="w-40">Mount Point</th><td>{d.mount_point || "-"}</td></tr>
                    <tr><th>File System</th><td>{d.file_system || "-"}</td></tr>
                    <tr><th>Capacity</th><td>{formatBytes(d.total_space)}</td></tr>
                    
                    <tr>
                      <th>Used / Total</th>
                      <td>
                        {formatBytes(d.used)} / {formatBytes(d.total_space)}
                        <div className="h-2 w-full overflow-hidden mb-1 mt-2">
                          <div
                            className="h-full bg-gray-300"
                            style={{ width: `${clamp(d.usedPct)}%` }}
                            aria-label={`Disk ${idx} usage`}
                          />
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
