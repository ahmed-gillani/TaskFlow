// src/pages/Habits.tsx
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import api from "../api/api.ts";
import { useToast } from "../context/ToastContext.tsx";

interface Habit {
  id: number;
  name: string;
  color: string;
  completedDates: string[];
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-purple-500");

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { showToast } = useToast();

  const colors = [
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-teal-500",
  ];

  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true);
        const res = await api.get("/habits");
        setHabits(res.data);
      } catch (err) {
        showToast("Failed to load habits", "error");
      } finally {
        setLoading(false);
      }
    };
    loadHabits();
  }, []);

  const resetForm = () => {
    setName("");
    setSelectedColor(colors[0]);
    setEditingHabit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit.id}`, { name, color: selectedColor });
        showToast("Habit updated successfully! 🎉", "success");
      } else {
        await api.post("/habits", { name, color: selectedColor });
        showToast("New habit added! Keep the streak going! 🔥", "success");
      }
      const res = await api.get("/habits");
      setHabits(res.data);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      showToast("Failed to save habit. Try again.", "error");
    }
  };

  const toggleToday = async (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = format(today, "yyyy-MM-dd");
    const newDates = habit.completedDates.includes(todayStr)
      ? habit.completedDates.filter(d => d !== todayStr)
      : [...habit.completedDates, todayStr];

    try {
      await api.put(`/habits/${habitId}`, { completedDates: newDates });
      const res = await api.get("/habits");
      setHabits(res.data);
      showToast("Habit updated for today! 💪", "success");
    } catch (err) {
      showToast("Failed to update habit", "error");
    }
  };

  const deleteHabit = async (id: number) => {
    try {
      await api.delete(`/habits/${id}`);
      const res = await api.get("/habits");
      setHabits(res.data);
      showToast("Habit deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete habit", "error");
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setSelectedColor(habit.color);
    setShowAddModal(true);
  };

  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    const sorted = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const todayStr = format(today, "yyyy-MM-dd");
    for (let date of sorted) {
      if (date === todayStr || streak > 0) streak++;
      else break;
    }
    return streak;
  };

  const maxStreak = Math.max(...habits.map(h => calculateStreak(h.completedDates)), 0);

  const getCompletionCountForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return habits.filter(h => h.completedDates.includes(dateStr)).length;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count === 1) return "bg-green-500/30";
    if (count === 2) return "bg-green-500/50";
    return "bg-green-500/80";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-400">Loading habits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Habit Tracker
      </h1>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-purple-400">{habits.length}</p>
          <p className="text-sm text-gray-300 mt-2">Active Habits</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-green-400">{maxStreak}</p>
          <p className="text-sm text-gray-300 mt-2">Longest Streak</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-pink-400">
            {habits.filter(h => h.completedDates.includes(format(today, "yyyy-MM-dd"))).length}
          </p>
          <p className="text-sm text-gray-300 mt-2">Today</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-orange-400">
            {habits.reduce((sum, h) => sum + h.completedDates.length, 0)}
          </p>
          <p className="text-sm text-gray-300 mt-2">Total Checks</p>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Habit Cards */}
        <div className="space-y-6">
          {habits.length === 0 ? (
            <div className="glass inner-glow p-16 text-center rounded-3xl">
              <p className="text-xl text-gray-400">No habits yet. Add one to build streaks!</p>
            </div>
          ) : (
            habits.map(habit => {
              const streak = calculateStreak(habit.completedDates);
              const todayCompleted = habit.completedDates.includes(format(today, "yyyy-MM-dd"));

              return (
                <div key={habit.id} className="glass inner-glow p-6 rounded-2xl glass-hover transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{habit.name}</h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Streak: <span className="text-2xl font-bold text-green-400">{streak}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => toggleToday(habit.id)}
                      className={`w-14 h-14 rounded-full ${todayCompleted ? habit.color + "/40" : "bg-white/10"} glass-hover flex items-center justify-center transition-all`}
                    >
                      {todayCompleted ? <Check size={28} className="text-white" /> : <Plus size={28} className="text-gray-400" />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(habit)}
                      className="flex-1 py-3 bg-purple-500/20 border border-purple-500/40 rounded-xl glass-hover flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl glass-hover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compact Heatmap */}
        <div className="glass inner-glow p-8 rounded-3xl">
          <h2 className="text-2xl font-bold text-center mb-6">{format(today, "MMMM yyyy")}</h2>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map(d => (
              <div key={d} className="text-gray-400 text-xs">{d}</div>
            ))}
            {monthDays.map((day, i) => {
              const count = getCompletionCountForDay(day);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm ${getHeatmapColor(count)} ${isToday(day) ? "ring-2 ring-purple-500/50" : ""}`}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-6 text-xs">
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-white/5 rounded"></div> None</span>
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500/30 rounded"></div> 1</span>
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500/50 rounded"></div> 2</span>
            <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500/80 rounded"></div> 3+</span>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl glass-hover text-3xl font-bold z-40"
      >
        +
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass inner-glow w-full max-w-lg p-10 rounded-3xl">
            <h2 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {editingHabit ? "Edit Habit" : "Add New Habit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <input
                type="text"
                placeholder="Habit Name (e.g., Exercise, Read)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-8 py-6 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-xl"
                required
                autoFocus
              />
              <div>
                <p className="text-gray-300 mb-4 text-lg">Choose Color</p>
                <div className="grid grid-cols-6 gap-4">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-2xl ${color} transition-all ${selectedColor === color ? "ring-4 ring-white/50 scale-110" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <button
                  type="submit"
                  className="flex-1 py-6 bg-gradient-to-r from-purple-500/40 to-pink-500/40 border border-purple-500/50 rounded-2xl glass-hover text-xl font-bold"
                >
                  {editingHabit ? "Update Habit" : "Add Habit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-10 py-6 bg-white/5 border border-white/10 rounded-2xl glass-hover text-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}