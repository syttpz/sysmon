import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Cpu from "./pages/Cpu"
import Disk from "./pages/Disk"
import Network from "./pages/Network"

function App() {
  return (
    <div className="flex h-screen">
      <Layout />
      <main className="flex-1 p-6 bg-black overflow-auto ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cpu" element={<Cpu />} />
          <Route path="/disk" element={<Disk />} />
          <Route path="/network" element={<Network />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
