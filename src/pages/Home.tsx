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
          <MonitorCog className="w-7 h-7"/> Overview
        </h1>

        <div className="flex items-center">
          <div className="ml-auto text-xs text-slate-400">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleString()}</span>}
          </div>
        </div>
        
        {loading && <div className="mt-6 text-sm">Loading…</div>}
        {error && <div className="mt-6 text-sm text-red-300">Failed to fetch data: {error}</div>}

        {data && !loading && !error && (
          <section className="mt-6">

            <table className="w-full text-sm">
              <tbody className="[&>tr>th]:text-slate-400 [&>tr>th]:font-normal [&>tr>th]:text-left [&>tr>th]:pr-4 [&>tr>*]:py-1 [&>tr>td]:font-mono">
                {([
                  ["Device Name", data.name ?? "-"],
                  ["CPU", data.cpu_brand],
                  ["Host Name", data.host_name ?? "-"],
                  ["OS Version", data.long_os_version ?? "-"],
                  ["Kernel", data.kernel_version],
                  ["Architecture", data.arch],
                  ["Serial Number", data.serial_num ?? "-"],
                  ["Memory", formatBytes(data.total_memory)],
                  ["Storage", formatBytes(totalDisk)],
                  ["Vendor", data.vendor ?? "-"],
                ] as [string, React.ReactNode][]).map(([label, value]) => (
                  <tr key={label}>
                    <th className="w-40">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
