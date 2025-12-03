# 📝 Blog Backend API  
A clean, modular and scalable backend for a Blog Application built with **Node.js**, **Express.js** and **PostgreSQL**.  
This backend includes full admin authentication, category management, post management, SEO-friendly metadata support, and a production-grade folder structure.

API Documentation: [`Here`](https://documenter.getpostman.com/view/38227871/2sB3dMyWmj)
---

## 🚀 Tech Stack
- **Node.js**
- **Express.js**
- **PostgreSQL (pg library)**
- **JWT Authentication**
- **BCrypt Password Hashing**
- **Dotenv for environment config**

---

## 📂 Project Folder Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Category.model.js
│   │   └── Post.model.js
│   │
│   ├── controllers/
│   │   ├── Auth.controller.js
│   │   ├── Category.controller.js
│   │   └── Post.controller.js
│   │
│   ├── routes/
│   │   ├── Auth.routes.js
│   │   ├── Category.routes.js
│   │   └── Post.routes.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── utils/
│   │   └── jwt.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/blogdb
JWT_SECRET=your_jwt_secret_key
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the project
```bash
git clone https://github.com/your-username/blog-backend.git
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Set up PostgreSQL database
Create a database (example):

```sql
CREATE DATABASE blogdb;
```

### 4️⃣ Start the server
```bash
npm run dev
```

Server will run on:  
👉 http://localhost:5000/

---

## 🔐 Authentication Endpoints (Admin Only)

### **Register Admin**
POST /api/auth/register

### **Login Admin**
POST /api/auth/login

---

## 🏷️ Category Endpoints

### **Create Category (Admin)**
POST /api/category/add

### **Get All Categories**
GET /api/category/

---

## 📝 Post Endpoints

### **Create New Post**
POST /api/post/add

### **Get All Posts**
GET /api/post/

---

## 🔒 Middleware
- auth.middleware.js (JWT protected routes)

---

## 🧩 Features
- Admin authentication (JWT)
- Category management
- Post management
- SEO meta support
- Clean folder structure
- PostgreSQL models

---

## 📌 Future Enhancements
- Image upload (Cloudinary)
- Pagination
- Search & filter
- Draft system
- Role-based permissions

---

### ✨ Developer  
**Masaud Ahmod — MERN Stack Developer**
