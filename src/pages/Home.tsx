import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const data = [
  { time: "12:00", temp: 48 },
  { time: "12:05", temp: 52 },
  { time: "12:10", temp: 50 },
  { time: "12:15", temp: 54 },
  { time: "12:20", temp: 53 },
  { time: "12:25", temp: 51 },
  { time: "12:30", temp: 55 },
]

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">系统概览</h1>

      {/* 图表区域 */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">历史 CPU 温度 (°C)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[40, 60]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
          <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">电脑型号</h3>
          <p className="text-xl font-bold">Dell Latitude 7490</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
          <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">操作系统</h3>
          <p className="text-xl font-bold">Windows 10 Pro</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
          <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">CPU 信息</h3>
          <p className="text-xl font-bold">Intel i7-8650U @ 1.90GHz</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
          <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">内存</h3>
          <p className="text-xl font-bold">16 GB</p>
        </div>
      </div>
    </div>
  )
}
