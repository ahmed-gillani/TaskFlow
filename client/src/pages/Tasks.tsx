// src/pages/Tasks.tsx
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import api from "../api/api.ts";
import { useToast } from "../context/ToastContext.tsx";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  completed: boolean;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [dueDate, setDueDate] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tasks");
        setTasks(res.data);
        setFilteredTasks(res.data);
      } catch (err) {
        showToast("Failed to load tasks", "error");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (filter === "Pending") setFilteredTasks(tasks.filter(t => !t.completed));
    else if (filter === "Completed") setFilteredTasks(tasks.filter(t => t.completed));
    else setFilteredTasks(tasks);
  }, [filter, tasks]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, { title, description, priority, dueDate });
        showToast("Task updated! 🎯", "success");
      } else {
        await api.post("/tasks", { title, description, priority, dueDate });
        showToast("New task added! 💪", "success");
      }
      const res = await api.get("/tasks");
      setTasks(res.data);
      setFilteredTasks(res.data);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      showToast("Failed to save task", "error");
    }
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        await api.put(`/tasks/${id}`, { ...task, completed: !task.completed });
        const res = await api.get("/tasks");
        setTasks(res.data);
        setFilteredTasks(res.data);
        showToast("Task status updated!", "success");
      } catch (err) {
        showToast("Failed to update task", "error");
      }
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      const res = await api.get("/tasks");
      setTasks(res.data);
      setFilteredTasks(res.data);
      showToast("Task deleted", "success");
    } catch (err) {
      showToast("Failed to delete task", "error");
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setShowAddModal(true);
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "High": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "";
    }
  };

  const completed = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        My Tasks
      </h1>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-purple-400">{tasks.length}</p>
          <p className="text-sm text-gray-300 mt-2">Total</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-green-400">{completed}</p>
          <p className="text-sm text-gray-300 mt-2">Completed</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-yellow-400">{tasks.filter(t => t.priority === "Medium").length}</p>
          <p className="text-sm text-gray-300 mt-2">Medium</p>
        </div>
        <div className="glass inner-glow p-6 rounded-2xl text-center">
          <p className="text-4xl font-bold text-red-400">{tasks.filter(t => t.priority === "High").length}</p>
          <p className="text-sm text-gray-300 mt-2">High Priority</p>
        </div>
      </div>

      {/* Compact Task Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full glass inner-glow p-16 text-center rounded-3xl">
            <p className="text-xl text-gray-400">No tasks found. Add one!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`glass inner-glow p-6 rounded-2xl glass-hover transition-all ${task.completed ? "opacity-60" : ""}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-lg font-bold ${task.completed ? "text-gray-500 line-through" : ""}`}>
                  {task.title}
                </h3>
                <button
                  onClick={() => toggleComplete(task.id)}
                  className={`p-2 rounded-xl glass-hover ${task.completed ? "bg-green-500/40" : "bg-white/10"}`}
                >
                  {task.completed ? <Check size={20} className="text-green-400" /> : <X size={20} className="text-gray-400" />}
                </button>
              </div>

              {task.description && <p className="text-gray-300 text-sm mb-4 line-clamp-2">{task.description}</p>}

              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-4 py-2 rounded-xl border text-sm ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(task)}
                  className="flex-1 py-3 bg-purple-500/20 border border-purple-500/40 rounded-xl glass-hover flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl glass-hover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button & Modal same as before */}
    </div>
  );
}