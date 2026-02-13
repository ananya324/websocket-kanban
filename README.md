# Real-Time Kanban Board (WebSocket + Testing)

A full-stack Kanban board application with real-time synchronization using WebSockets.  
The project demonstrates drag-and-drop functionality, file uploads with validation, task prioritization, and automated testing using Vitest and Playwright.

---

## 🚀 Live Demo

Frontend Deployment:
https://websocket-kanban-sigma.vercel.app/

---

## 🧠 Features

- Real-time task synchronization using Socket.IO
- Drag and drop between columns (To Do, In Progress, Done)
- Task priority selection (Low, Medium, High)
- Task category tagging
- File upload with validation
- Dynamic progress chart updates
- REST API + WebSocket integration
- Unit tests (Vitest)
- End-to-End tests (Playwright)

---

## 🏗️ Tech Stack

### Frontend
- React
- Vite
- Socket.IO Client
- Chart.js (for progress visualization)
- Vitest (unit testing)
- Playwright (E2E testing)

### Backend
- Node.js
- Express
- Socket.IO
- Multer (file uploads)

---

## 📂 Project Structure

```bash
websocket-kanban/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── tasks.js
│   ├── uploads/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── README.md
└── package.json
```


