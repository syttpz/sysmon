import { Link } from "react-router-dom";
//import { Bolt } from 'lucide-react';

export default function Layout() {
  return (
    <aside className="w-38 min-h-screen bg-gradient-to-b from-gray-800 to-black text-gray-200 p-4 flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">SysMon</h1>
      <nav className="flex flex-col gap-3 ">
        <Link to="/" className="hover:text-blue-300">Overview</Link>
        <Link to="/cpu" className="hover:text-blue-300">CPU</Link>
        <Link to="/disk" className="hover:text-blue-300">Disk</Link>
        <Link to="network" className="hover:text-blue-300">Network</Link>
      </nav>
      <div className="mt-auto flex items-center justify-between">
         
        {/*
        <span className="text-sm font-normal">v1.01</span>
        <Link to="/settings" className="block hover:text-blue-300 mb-3">
          <Bolt className="ml-auto" />
        </Link>
         */}
      </div>
    </aside>
  );
}