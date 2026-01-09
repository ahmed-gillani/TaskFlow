# TaskFlow — Premium Productivity App

![TaskFlow Preview](https://via.placeholder.com/1200x600/0a0e17/a855f7?text=TaskFlow+-+Premium+Productivity+App)  
*A modern full-stack productivity app to manage tasks and build powerful habits with a stunning dark glassmorphism UI.*

## 🚀 Features

- **Task Management**  
  Create, edit, delete tasks with priority (Low/Medium/High), due dates, descriptions, and completion tracking.

- **Habit Tracker**  
  Add habits, mark daily completion, view current & longest streaks, and monthly heatmap visualization.

- **Premium Dark Glassmorphism Design**  
  Beautiful, responsive UI with glass cards, neon gradients, hover animations, inner glows, and smooth transitions.

- **Real Authentication**  
  Secure register/login system using JWT tokens. User-specific data.

- **Dashboard with Stats**  
  Visual overview: task completion rate (circular progress), total tasks, completed tasks, active habits, current streak, and daily motivational quote.

- **Toast Notifications**  
  Elegant success/error popups for every action (add, update, delete, complete).

- **Fully Responsive**  
  Works perfectly on desktop, tablet, and mobile devices.

- **Local Persistence**  
  All data saved in real SQLite database via backend.

## 🛠 Tech Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- Lucide React Icons
- React Router v6
- Axios
- Context API (Auth & Toast)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcrypt for password hashing

## 📂 Project Structure
taskflow/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/           # Dashboard, Tasks, Habits, Login
│   │   ├── components/      # Layout, Toast
│   │   ├── context/         # AuthContext, ToastContext
│   │   └── api/             # Axios instance
│   └── ...
├── server/                  # Backend (Express + Prisma)
│   ├── src/
│   │   └── server.ts        # Main server
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── dev.db               # SQLite database file
└── README.md
text## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
2. Start Backend
Bashcd server
npm install
npx prisma generate
npm run dev
Backend runs on http://localhost:5000
3. Start Frontend (in a new terminal)
Bashcd client
npm install
npm run dev
Frontend runs on http://localhost:5173
Open your browser and go to http://localhost:5173
Register → Login → Start managing your productivity!
🌟 Future Plans

Add notifications
Export data (CSV/JSON)
Multiple themes
Mobile PWA support
Live deployment

🤝 Contributing
Contributions are welcome! Feel free to:

Open issues
Submit pull requests
Suggest new features

📄 License
This project is licensed under the MIT License.

Made with ❤️ by Syed Ahmed
