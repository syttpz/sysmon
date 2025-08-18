import { useEffect, useMemo, useState } from "react";
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

export default function Cpu() {
  const [data, setData] = useState<CpuMemInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      try {
        const res = await invoke<CpuMemInfo>("get_cpu_mem_info");
        if (!alive) return;
        setData(res);
        setErr(null);
        setLastUpdated(new Date());
      } catch {
        if (!alive) return;
        setErr("Failed to fetch CPU info");
      }
    };
    fetchData();
    const t = setInterval(fetchData, 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const totalMem = useMemo(() => data ? data.used_memory + data.available_memory : 0, [data]);
  const memoryUsage = useMemo(() => data && totalMem ? (data.used_memory / totalMem) * 100 : 0, [data, totalMem]);

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CpuIcon className="w-7 h-7 text-slate-400" /> CPU
        </h1>
        <div className="flex items-center">
          <div className="ml-auto text-xs text-slate-400">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleString()}</span>}
          </div>
        </div>

        {!data && !err && <div className="mt-6 text-sm">Loading…</div>}
        {err && <div className="mt-6 text-sm text-red-300">{err}</div>}

        {data && !err && (
          <div className="mt-6 space-y-6">
            {/* Overview */}
            <table className="w-full text-sm border border-slate-800 rounded overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-800">
                  <th className="w-40 p-2 text-left text-slate-400">CPU </th>
                  <td className="p-2">{data.cpu_brand?.[0] ?? "-"}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <th className="w-40 p-2 text-left text-slate-400">Global Usage</th>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span>{data.global_cpu_usage.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-slate-200"
                        style={{ width: `${Math.max(0, Math.min(100, data.global_cpu_usage))}%` }}
                      />
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <th className="w-40 p-2 text-left text-slate-400">Memory</th>
                  <td className="p-2">
                    Used {formatBytes(data.used_memory)} / {formatBytes(totalMem)}
                    <span className="text-slate-400"> ({memoryUsage.toFixed(1)}%)</span>
                    <div className="mt-2 h-2 w-full rounded bg-slate-800 overflow-hidden">
                      <div className="h-full bg-slate-200" style={{ width: `${Math.max(0, Math.min(100, memoryUsage))}%` }} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="w-40 p-2 text-left text-slate-400">Uptime</th>
                  <td className="p-2">
                    {formatTime(data.up_time)} <span className="text-slate-400 text-xs">({data.up_time}s)</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div>
            <h2 className="text-sm font-medium mb-2">Per-core Usage</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.cpu_usage.map((u, i) => (
                <Core
                  key={i}
                  index={i+1}
                  usage={u}
                  freqMHz={data.cpu_frequency?.[i]}
                />
              ))}
            </div>
          </div>

          </div>
        )}
      </div>
    </div>
  );
}
