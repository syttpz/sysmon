import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MonitorCog } from "lucide-react"; //https://lucide.dev/icons/
import { formatBytes } from "../utils/util";

interface StaticSysInfo {
  name: String | null;
  arch: string;
  cpu_brand: string;
  kernel_version: string;
  host_name: string | null;
  long_os_version: string | null;
  total_memory: number; 
  total_space: number[];
  serial_num: string | null;
  vendor: string | null;
}

export default function Home() {
  const [data, setData] = useState<StaticSysInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  useEffect(() => {
     //fetch once
    fetchStatic(); 
  }, []);


  async function fetchStatic() {
    setLoading(true);
    setError(null);
    
    try {
      const static_data = await invoke<StaticSysInfo>("get_static_info"); 
      setData(static_data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const totalDisk = useMemo(
    () => (data?.total_space?.reduce((a, b) => a + b, 0) ?? 0),
    [data]
  );

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MonitorCog className="w-7 h-7 text-slate-400"/> Overview
        </h1>

        <div className="flex items-center">
          <div className="ml-auto text-xs text-slate-400">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleString()}</span>}
          </div>
        </div>
        
        {loading && <div className="mt-6 text-sm">Loading…</div>}
        {error && <div className="mt-6 text-sm text-red-300">Failed to fetch data: {error}</div>}

        {data && !loading && !error && (
          <div className="mt-6 space-y-6">
            <table className="w-full text-sm border border-slate-800 rounded overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">Device Name</th><td className="p-2">{data.name ?? "-"}</td></tr>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">Host Name</th><td className="p-2">{data.host_name ?? "-"}</td></tr>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">OS Version</th><td className="p-2">{data.long_os_version ?? "-"}</td></tr>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">Kernel</th><td className="p-2">{data.kernel_version}</td></tr>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">Architecture</th><td className="p-2">{data.arch}</td></tr>
                <tr className="border-b border-slate-800">
                  <th className="w-40 p-2 text-left text-slate-400">Serial number</th>
                  <td className="p-2">
                    <div className="relative group">
                      <span className="invisible group-hover:visible">{data.serial_num}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-800"><th className="w-40 p-2 text-left text-slate-400">Vendor</th><td className="p-2">{data.vendor}</td></tr>
                <tr><th className="w-40 p-2 text-left text-slate-400">CPU</th><td className="p-2">{data.cpu_brand}</td></tr>
              </tbody>
            </table>

            <div className="flex flex-row space-x-20">
              <div>
                <h2 className="text-sm font-medium mb-2">Memory</h2>
                <div className="text-sm">Total: {formatBytes(data.total_memory)}</div>
              </div>

              <div>
                <h2 className="text-sm font-medium mb-2">Storage</h2>
                <div className="text-sm mb-2">Total capacity: {formatBytes(totalDisk)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
