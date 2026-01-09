// server/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretchangeinprod";

// SQLite Adapter (Prisma v7+ required)
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

// PrismaClient with adapter
const prisma = new PrismaClient({
  adapter,
});

// MIDDLEWARE – YE ZAROORI HAIN!
app.use(express.json()); // <-- Body parse karne ke liye (req.body undefined error fix)
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173", // frontend port
  credentials: true,
}));

// Register Route
app.post("/api/register", async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { username, password } = body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.json({
      message: "User created successfully",
      user: { id: user.id, username: user.username },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { username, password } = body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user.id, username: user.username },
  });
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Tasks Routes
app.get("/api/tasks", authenticate, async (req: any, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

app.post("/api/tasks", authenticate, async (req: any, res) => {
  const body = req.body;
  const task = await prisma.task.create({
    data: {
      title: body.title || "Untitled",
      description: body.description || "",
      priority: body.priority || "Medium",
      dueDate: body.dueDate || null,
      userId: req.userId,
    },
  });
  res.json(task);
});

app.put("/api/tasks/:id", authenticate, async (req: any, res) => {
  const taskId = Number(req.params.id);
  const body = req.body;
  const task = await prisma.task.update({
    where: { id: taskId, userId: req.userId },
    data: body,
  });
  res.json(task);
});

app.delete("/api/tasks/:id", authenticate, async (req: any, res) => {
  const taskId = Number(req.params.id);
  await prisma.task.delete({
    where: { id: taskId, userId: req.userId },
  });
  res.json({ message: "Task deleted successfully" });
});

// Habits Routes
app.get("/api/habits", authenticate, async (req: any, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.userId },
  });
  res.json(habits);
});

app.post("/api/habits", authenticate, async (req: any, res) => {
  const body = req.body;
  const habit = await prisma.habit.create({
    data: {
      name: body.name || "New Habit",
      color: body.color || "bg-purple-500",
      completedDates: [],
      userId: req.userId,
    },
  });
  res.json(habit);
});

app.put("/api/habits/:id", authenticate, async (req: any, res) => {
  const habitId = Number(req.params.id);
  const body = req.body;
  const habit = await prisma.habit.update({
    where: { id: habitId, userId: req.userId },
    data: body,
  });
  res.json(habit);
});

app.delete("/api/habits/:id", authenticate, async (req: any, res) => {
  const habitId = Number(req.params.id);
  await prisma.habit.delete({
    where: { id: habitId, userId: req.userId },
  });
  res.json({ message: "Habit deleted successfully" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});