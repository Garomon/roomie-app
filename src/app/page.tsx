import Image from "next/image";
import Dashboard from "@/components/Dashboard";
import Link from "next/link";
import { FileText, DollarSign, CheckSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 pb-20">
      <div className="container mx-auto">
        {/* Hero Section */}
        <header className="mb-12 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                VIBRA ALTA
              </h1>
              <p className="text-xl text-gray-400 font-light tracking-wide">
                THE MANIFESTO ANZURES
              </p>
            </div>
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">System Online</span>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <Dashboard />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/manifesto" className="glass-card p-8 hover:bg-white/5 transition-colors group">
            <FileText className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">El Manifiesto</h2>
            <p className="text-gray-400">Reglas de convivencia, cocina y visitas.</p>
          </Link>

          <Link href="/finance" className="glass-card p-8 hover:bg-white/5 transition-colors group">
            <DollarSign className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Finanzas</h2>
            <p className="text-gray-400">Tracking de renta, servicios y caja común.</p>
          </Link>

          <Link href="/chores" className="glass-card p-8 hover:bg-white/5 transition-colors group">
            <CheckSquare className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Tareas</h2>
            <p className="text-gray-400">Limpieza, cocina y mantenimiento.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
