import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside className="w-48 min-h-screen bg-zinc-800 text-white p-4">
      <h1 className="text-xl font-bold mb-6">SysMonitor</h1>
      <nav className="flex flex-col gap-3">
        <Link to="/" className="hover:text-blue-400">首页</Link>
        <Link to="/cpu" className="hover:text-blue-400">CPU</Link>
        <Link to="/memory" className="hover:text-blue-400">内存</Link>
        <Link to="/disk" className="hover:text-blue-400">磁盘</Link>
      </nav>
    </aside>
  )
}
