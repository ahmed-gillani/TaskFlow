// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.ts";
import { useAuth } from "../context/AuthContext.tsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";
      const response = await api.post(endpoint, { username, password });

      if (isRegister) {
        setMessage("Account created successfully! 🎉 Now login with your credentials.");
        setIsRegister(false);
        setPassword("");
      } else {
        const { token, user } = response.data;
        login(token, user);
        navigate("/");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Something went wrong. Try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center p-4">
      <div className="glass inner-glow w-full max-w-lg p-12 rounded-3xl shadow-2xl">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-xl text-gray-300 mt-4">
            {isRegister ? "Join the productivity revolution" : "Welcome back, champion!"}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-8 p-6 bg-green-500/20 border border-green-500/50 rounded-2xl text-center text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-gray-300 mb-2 text-lg">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-8 py-6 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-xl transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-lg">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-6 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-xl transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-500/40 to-pink-500/40 border border-purple-500/50 rounded-2xl glass-hover text-2xl font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Toggle Register/Login */}
        <div className="text-center mt-10">
          <p className="text-gray-300 text-lg">
            {isRegister ? "Already have an account?" : "New to TaskFlow?"}
          </p>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setError("");
            }}
            className="mt-4 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
          >
            {isRegister ? "Login Here" : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
}