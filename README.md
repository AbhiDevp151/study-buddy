# 📚 Study Buddy — Your All-in-One AI-Powered Study Workspace

Study Buddy is a modern, full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to help students organize their academic life. It provides a seamless workspace featuring a rich-text notes manager, interactive task tracking, pomodoro focus timers, and an integrated AI Tutor powered by Google's Generative AI to simplify complex study topics[cite: 5, 6].

---

## 🚀 Live Demo
- **Frontend / Client:** [View Live App](https://study-buddy-7yg9.vercel.app) *(Update with your exact Vercel frontend URL)*
- **Backend / API:** Hosted on Vercel (Connected to MongoDB Atlas)

---

## ✨ Key Features

- **📝 Smart Notes & Tasks Management:** Create, organize, and manage subject notes and daily academic task lists in one clean dashboard[cite: 5, 6].
- **🤖 AI Tutor Integration:** Ask questions or summarize core study concepts instantly using Google's Generative AI (Google GenAI SDK)[cite: 6].
- **⏱️ Focus & Study Tools:** Built-in productivity features including study trackers and timers to keep you on track[cite: 6].
- **🔒 Secure Authentication:** Robust JWT-based (JSON Web Token) user authentication for secure data privacy and protected routing.
- **🎨 Responsive UI:** Built with React, Tailwind CSS, and Lucide icons for a sleek, modern, and mobile-friendly user experience.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js** (Vite)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios / Fetch API** for HTTP requests

### **Backend**
- **Node.js** & **Express.js** (ES Modules)
- **Mongoose** (ODM for MongoDB)
- **JSON Web Token (JWT)** & **Bcrypt.js** for auth & hashing
- **Google GenAI SDK** for AI tutor capabilities

### **Database & Deployment**
- **MongoDB Atlas** (Cloud Database)
- **Vercel** (Frontend & Backend Cloud Deployment)

---

## 📁 Project Structure

```text
study-buddy/
│
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components (Notes, Tasks, AI Tutor, Focus)
│   │   ├── services/       # API configuration & service calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Express Backend
    ├── models/             # Mongoose Schemas (User, Note, Task, Chat)
    ├── routes/             # API Endpoints (Auth, Notes, Tutor, etc.)
    ├── middleware/         # JWT Auth Middleware
    ├── server.js           # Entry point
    └── package.json



2. Configure Environment Variables
Create a .env file in your root/backend folder and add the required credentials:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_genai_api_key
And in your frontend configuration or .env:

Code snippet
VITE_API_URL=http://localhost:5000
3. Install Dependencies & Run
Bash
# Install dependencies for server/root
npm install

# Start the backend server
npm run dev
🚀 Deployment
The application is fully configured and deployed on Vercel:

Backend: Deployed as a serverless Node.js function with ESM support ("type": "module").

Frontend: Built via Vite and hosted on Vercel, securely communicating via environment-based API endpoints (VITE_API_URL).

👨‍💻 Author
Abhishek Singh Tomar

GitHub: @AbhiDevp151

⭐️ Show your support
If you found this project helpful, please give it a ⭐️ on GitHub!
