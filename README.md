# 🎓 Student Management System Backend

This is the backend for a simple **Student Management System** built with **Node.js**, **Express**, and **MongoDB**.  
It provides CRUD operations for managing student records and supports image uploads using **Multer**.

---

## 🚀 Features

### 🧑‍🎓 Student Management
- Create, update, delete student records
- Fetch all students or a specific student by ID
- Store details like name, email, age, department, phone, etc.
- Upload and save student images using Multer (stored locally)

---

## 🧰 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Express.js** | Backend server & routing |
| **MongoDB + Mongoose** | Database & schema modeling |
| **Multer** | Handling image uploads |
| **dotenv** | Environment configuration |
| **cors** | Allowing frontend access |
| **path** | File directory handling |

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone <repo-url>
cd backend

### 2️⃣ Install Dependencies

```bash
npm install

---

## ⚙️ Configure Environment Variables

PORT=5000
MONGO_URI=your_mongodb_connection_string

---

## ▶️ Start the Server

npm run dev    # development (nodemon)
npm start      # production

The server will run on:
http://localhost:5000

---
## 📁 API Endpoints
🧑‍🎓 Student Routes

| Method | Endpoint        | Description                        |
| ------ | --------------- | ---------------------------------- |
| GET    | `/students`     | Get all students                   |
| GET    | `/students/:id` | Get student by ID                  |
| POST   | `/students`     | Create student (with image upload) |
| PUT    | `/students/:id` | Update student                     |
| DELETE | `/students/:id` | Delete student                     |

---

## 📂 Project Structure

backend/
│── server.js
│── models/
│── routes/
│── uploads/          # Multer image folder
│── package.json
│── .env

---
## 📸 Image Upload Handling

This project uses Multer to handle image uploads.

Uploaded images are stored in:

/uploads

They are served statically from:

http://localhost:5000/uploads/<filename>

---
## ✔️ CORS Setup

CORS is enabled globally using:

app.use(cors());

---
## 📝 Scripts

From package.json:

"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}


---





