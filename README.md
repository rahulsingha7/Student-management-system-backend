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
```
### 2️⃣ Install Dependencies

```bash
npm install

```
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
## 🔌 API Endpoints Overview

### 🔑 Admin Authentication
- `POST /api/admin/auth/register` – Register an admin  
- `POST /api/admin/auth/login` – Admin login + JWT  

---

### 🧑‍💼 Admin Management
- `GET /api/admin` – Get all admins  
- `GET /api/admin/:id` – Get admin by ID  
- `PUT /api/admin/:id` – Update admin  
- `DELETE /api/admin/:id` – Delete admin  

---

### 🗂 Academic Setup (Admin)

#### 🎓 Sessions
- `GET /api/admin/sessions` – Get all sessions  
- `POST /api/admin/sessions` – Create session  
- `PUT /api/admin/sessions/:id` – Update session  
- `DELETE /api/admin/sessions/:id` – Delete session  

#### 🧮 Semesters
- `GET /api/admin/semesters` – Get all semesters  
- `POST /api/admin/semesters` – Create semester  
- `PUT /api/admin/semesters/:id` – Update semester  
- `DELETE /api/admin/semesters/:id` – Delete semester  

#### 🏫 Sections
- `GET /api/admin/sections` – Get all sections  
- `POST /api/admin/sections` – Create section  
- `PUT /api/admin/sections/:id` – Update section  
- `DELETE /api/admin/sections/:id` – Delete section  

#### 📘 Subjects
- `GET /api/admin/subjects` – Get all subjects  
- `POST /api/admin/subjects` – Create subject  
- `PUT /api/admin/subjects/:id` – Update subject  
- `DELETE /api/admin/subjects/:id` – Delete subject  

#### 🧑‍🏫 Teacher Scheduling
- `GET /api/admin/teacher-schedule` – Get all teacher schedules  
- `POST /api/admin/teacher-schedule` – Create teacher schedule  
- `PUT /api/admin/teacher-schedule/:id` – Update teacher schedule  
- `DELETE /api/admin/teacher-schedule/:id` – Delete teacher schedule  

#### 📝 Student Enrollment
- `POST /api/admin/enroll` – Enroll student into subjects  
- `GET /api/admin/enroll` – View enrollments  

#### 📊 Admin Dashboard / Statistics
- `GET /api/admin/statistics` – Student/teacher analytics  
- `GET /api/admin/results` – View submitted results  

---

### 👨‍🏫 Teacher Panel

#### 📝 CT Exams
- `GET /api/teacher/ct-exams` – Get all CT exams  
- `POST /api/teacher/ct-exams` – Create CT exam  
- `PUT /api/teacher/ct-exams/:id` – Update CT exam  
- `DELETE /api/teacher/ct-exams/:id` – Delete CT exam  

#### 🧑‍🏫 Attendance
- `POST /api/teacher/attendance` – Mark attendance  
- `GET /api/teacher/attendance/:classId` – Get attendance by class  

#### 📝 Assignments
- `GET /api/teacher/assignments` – Get all assignments  
- `POST /api/teacher/assignments` – Create assignment  
- `PUT /api/teacher/assignments/:id` – Update assignment  
- `DELETE /api/teacher/assignments/:id` – Delete assignment  

#### 📊 Exam Results
- `POST /api/teacher/results` – Upload result  
- `GET /api/teacher/results/:classId` – View class results  

---

### 🧑‍🎓 Student Routes

#### 📁 Student Management (CRUD)
- `GET /api/students` – Get all students  
- `GET /api/students/:id` – Get student by ID  
- `POST /api/students` – Create a student (with image upload)  
- `PUT /api/students/:id` – Update student  
- `DELETE /api/students/:id` – Delete student  

#### 📚 Enrollment
- `GET /api/student/enrollment` – Get enrollments  
- `POST /api/student/enrollment` – Request enrollment  

#### 🗓 Student Schedule
- `GET /api/student/schedule` – Get timetable  

#### 📝 Assignments
- `GET /api/student/assignments` – Get student assignments  
- `POST /api/student/assignments/submit` – Submit assignment  

#### 🧪 CT Exams
- `GET /api/student/exam` – Get CT exam list  

#### 🧍 Attendance
- `GET /api/student/attendance` – Student attendance records  

#### 🎓 Grades
- `GET /api/student/grade` – Student grades  

---

### 🧾 File & Uploads
- `/uploads/*` – Static access to uploaded images  

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









