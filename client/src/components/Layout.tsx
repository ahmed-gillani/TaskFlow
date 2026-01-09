// src/components/Layout.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, CheckSquare, Flame, LogOut, Menu, X, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    { path: "/habits", label: "Habits", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#1e1b4b] to-[#0f172a]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl glass-hover">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl glass-hover">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 glass border-r border-white/10 p-8 flex flex-col transition-transform duration-300 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <h1 className="text-4xl font-bold mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden lg:block">
          TaskFlow
        </h1>

        <nav className="flex-1 space-y-4 mt-10 lg:mt-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-6 px-6 py-5 rounded-2xl glass-hover transition-all ${
                  active ? "bg-white/10 border border-purple-500/50" : ""
                }`}
              >
                <Icon size={28} className={active ? "text-purple-400" : "text-gray-400"} />
                <span className="text-xl font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen flex flex-col pt-20 lg:pt-0">
        <header className="glass border-b border-white/10 px-8 lg:px-12 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold hidden lg:block">
            {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-xl glass-hover hidden lg:block">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <span className="text-xl text-gray-300 hidden lg:block">Hello, {user?.username || "User"}!</span>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-2xl glass-hover flex items-center gap-3 text-lg"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}