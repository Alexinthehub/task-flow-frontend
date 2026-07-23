# TaskFlow – Your Personal Task Management Assistant

TaskFlow is a simple yet powerful task management app designed to help you organize your daily work, stay on top of deadlines, and collaborate with others – all in one place.

Whether you're a student, a professional, or a team leader, TaskFlow makes it easy to:

- ✅ **Create and track tasks** – add titles, descriptions, due dates, and priorities.
- 🔒 **Lock sensitive tasks** – protect important tasks with a password.
- 📌 **Pin important tasks** – keep them at the top of your list.
- ⭐ **Favourite your top tasks** – mark them for quick access.
- 🔔 **Get notifications** – never miss a deadline.
- 📧 **Share tasks** – send a link to anyone, even if they don't have an account.
- 📊 **View analytics** – see your task distribution by priority, status, and category.
- 🌓 **Dark/Light mode** – choose the theme that suits you.

---

## 🧭 How It Works (Step by Step)

Here's what you can do with TaskFlow:

1. **Sign Up / Login** – create an account with your email and password.
2. **Dashboard** – see an overview of your tasks, stats, and quick actions.
3. **Create a Task** – add a title, description, due date, priority, and optional categories.
4. **Manage Tasks** – view, edit, delete, pin, favourite, or lock tasks.
5. **Share a Task** – generate a shareable link and send it via email.
6. **Receive Notifications** – get reminders for tasks due soon.
7. **Profile Settings** – update your avatar, nickname, and password.
8. **Dark/Light Mode** – toggle between themes at any time.

---

## 🖼️ Screenshots (Coming Soon)

| Dashboard                               | Tasks List                      | Task Modal                      |
| --------------------------------------- | ------------------------------- | ------------------------------- |
| ![Dashboard](screenshots/dashboard.png) | ![Tasks](screenshots/tasks.png) | ![Modal](screenshots/modal.png) |

| Lock Flow                     | Sharing                         | Dark Mode                     |
| ----------------------------- | ------------------------------- | ----------------------------- |
| ![Lock](screenshots/lock.png) | ![Share](screenshots/share.png) | ![Dark](screenshots/dark.png) |

---

## 🛠️ Technologies Used

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| **Frontend**   | React 18, Vite, Tailwind CSS, Recharts          |
| **Backend**    | Django REST Framework, JWT, PostgreSQL / SQLite |
| **Email**      | SMTP (Gmail) / SendGrid                         |
| **Deployment** | Frontend: Netlify / Vercel / GitHub Pages       |

---

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/task-flow-frontend.git
cd task-flow-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The app will be available at http://localhost:5173.

📁 Project Structure
text
task-flow-frontend/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers (Auth, Theme, Language)
│   ├── pages/             # Page components (Login, Dashboard, Tasks, etc.)
│   ├── services/          # API service layer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
└── README.md
🤝 Contributing
We welcome contributions! Please open an issue or submit a pull request.

📄 License
This project is licensed under the MIT License.

📬 Contact
Project Link: https://github.com/your-username/task-flow-frontend

Live Demo: (coming soon)

Made with ❤️ by the TaskFlow Team
```
