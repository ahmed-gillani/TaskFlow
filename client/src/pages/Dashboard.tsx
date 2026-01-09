// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { CheckSquare, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.ts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    activeHabits: 0,
    currentStreak: 0,
  });
  const [quote, setQuote] = useState("Loading inspiration...");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [tasksRes, habitsRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/habits")
        ]);

        const tasks = tasksRes.data;
        const habits = habitsRes.data;

        const completed = tasks.filter((t: any) => t.completed).length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const streaks = habits.map((h: any) => {
          const dates = h.completedDates || [];
          if (dates.length === 0) return 0;
          const sorted = dates.sort().reverse();
          let streak = 0;
          const today = new Date().toISOString().split("T")[0];
          for (let date of sorted) {
            if (date === today || streak > 0) streak++;
            else break;
          }
          return streak;
        });
        const maxStreak = Math.max(...streaks, 0);

        setStats({
          totalTasks: total,
          completedTasks: completed,
          completionRate,
          activeHabits: habits.length,
          currentStreak: maxStreak,
        });
      } catch (err) {
        console.error("Failed to load stats");
      }
    };

    const quotes = [
      "Small steps every day lead to big results.",
      "Consistency is the key to success.",
      "You are capable of amazing things.",
      "Progress, not perfection.",
      "One day at a time.",
      "Your future self will thank you.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    loadStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Welcome to Your Productivity Hub
      </h2>

      <p className="text-center text-lg text-gray-300 mb-12 italic">
        "{quote}"
      </p>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-purple-400">{stats.totalTasks}</p>
          <p className="text-sm text-gray-300 mt-2">Total Tasks</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-green-400">{stats.completedTasks}</p>
          <p className="text-sm text-gray-300 mt-2">Completed</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-pink-400">{stats.activeHabits}</p>
          <p className="text-sm text-gray-300 mt-2">Active Habits</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-orange-400">{stats.currentStreak}</p>
          <p className="text-sm text-gray-300 mt-2">Current Streak</p>
        </div>
      </div>

      {/* Completion Rate Circle (Compact) */}
      <div className="glass inner-glow p-8 rounded-3xl text-center mb-12">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.completionRate / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-3xl font-bold">{stats.completionRate}%</p>
          </div>
        </div>
        <p className="text-lg text-gray-300 mt-6">Task Completion Rate</p>
      </div>

      {/* Compact Quick Access Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div
          className="glass inner-glow p-10 rounded-3xl text-center glass-hover transition-all cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
            <CheckSquare size={40} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Tasks</h3>
          <p className="text-gray-300 text-sm mb-6">Manage your daily to-do with priorities</p>
          <button className="px-8 py-3 bg-purple-500/30 border border-purple-500/50 rounded-xl glass-hover text-base font-medium">
            Go to Tasks →
          </button>
        </div>

        <div
          className="glass inner-glow p-10 rounded-3xl text-center glass-hover transition-all cursor-pointer"
          onClick={() => navigate("/habits")}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-pink-500/20 rounded-full flex items-center justify-center">
            <Flame size={40} className="text-pink-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Habits</h3>
          <p className="text-gray-300 text-sm mb-6">Build streaks and better routines</p>
          <button className="px-8 py-3 bg-pink-500/30 border border-pink-500/50 rounded-xl glass-hover text-base font-medium">
            Track Habits →
          </button>
        </div>
      </div>
    </div>
  );
}