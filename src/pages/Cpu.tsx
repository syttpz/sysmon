import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Cpu as CpuIcon } from "lucide-react";
import Core from "../components/Core";
import { formatBytes, formatTime } from "../utils/util";

type CpuMemInfo = {
  available_memory: number;
  global_cpu_usage: number;
  up_time: number;
  used_memory: number;
  cpu_usage: number[];
  cpu_frequency: number[];
  cpu_brand: string[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export default function Cpu() {
  const [data, setData] = useState<CpuMemInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      try {
        const res = await invoke<CpuMemInfo>("get_cpu_mem_info");
        if (!alive) return;
        setData(res);
        setErr(null);
      } catch {
        if (!alive) return;
        setErr("Failed to fetch CPU info");
      }
    };
    fetchData();
    const t = setInterval(fetchData, 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const totalMem = data ? data.used_memory + data.available_memory : 0;
  const memoryUsage = data && totalMem ? (data.used_memory / totalMem) * 100 : 0;

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <CpuIcon className="h-6 w-6" /> CPU
        </h1>

        {!data && !err && <p className="mt-4 text-sm text-slate-400">Loading…</p>}
        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

        {data && (
          <div className="mt-6 space-y-6">
            <section>
   
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-400">CPU</span>
                <span className="font-mono">{data.cpu_brand?.[0] ?? "-"}</span>
              </div>

              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-400">Global Usage</span>
                <span className="font-mono">{data.global_cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gray-300"
                  style={{ width: `${clamp(data.global_cpu_usage)}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-sm py-1">
                <span className="text-slate-400">Memory</span>
                <span className="font-mono">
                  {formatBytes(data.used_memory)} / {formatBytes(totalMem)} ({memoryUsage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gray-300"
                  style={{ width: `${clamp(memoryUsage)}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-sm py-1">
                <span className="text-slate-400">Uptime</span>
                <span className="font-mono">
                  {formatTime(data.up_time)} <span className="text-slate-400">({data.up_time}s)</span>
                </span>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-slate-300">Per-core Usage</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.cpu_usage.map((u, i) => (
                  <Core key={i} index={i + 1} usage={u} freqMHz={data.cpu_frequency?.[i]} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
