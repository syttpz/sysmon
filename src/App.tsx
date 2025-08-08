import { Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Home from "./pages/Home"
//import Cpu from "./pages/Cpu"
//import Memory from "./pages/Memory"
//import Disk from "./pages/Disk"

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
