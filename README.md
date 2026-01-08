# 📝 Blog Platform - MERN Stack Project

A modern, full-stack blog platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a public-facing blog, admin dashboard, and comprehensive content management system.

## 🎯 Project Overview

This blog platform allows users to:
- **Read blog posts** on a beautiful public-facing website
- **Manage content** through an admin dashboard
- **Subscribe to newsletters** for updates
- **Interact with posts** through likes and comments
- **Organize content** by categories
- **Control user access** with role-based authentication

The project consists of three main applications:
1. **Client** - Public-facing blog website (Next.js)
2. **Dashboard** - Admin/content management interface (Next.js)
3. **Server** - RESTful API backend (Express.js + PostgreSQL)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL** - Relational database
- **JWT (JSON Web Tokens)** - Authentication
- **BCrypt** - Password hashing
- **Cloudinary** - Image upload and management
- **Nodemailer** - Email service

### Tools & Libraries
- **Multer** - File upload handling
- **Cookie Parser** - Cookie management
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

---

## 📁 Project Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │  Dashboard  │         │   Server    │
│  (Next.js)  │────────▶│  (Next.js)  │────────▶│ (Express.js)│
│             │         │             │         │             │
│ Public Blog │         │ Admin Panel │         │   REST API   │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                        │
                                                        ▼
                                                ┌─────────────┐
                                                │ PostgreSQL  │
                                                │  Database   │
                                                └─────────────┘
```

### Folder Structure

```
Blog-project/
│
├── client/                 # Public-facing blog website
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Home page
│   │   ├── blog/         # Blog listing page
│   │   ├── categories/   # Category page
│   │   └── about/        # About page
│   ├── components/        # React components
│   │   ├── Navbar.tsx
│   │   └── NewsletterSubscription.tsx
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
│
├── dashboard/             # Admin dashboard
│   ├── app/              # Next.js app directory
│   │   ├── login/        # Login page
│   │   ├── register/    # Registration page
│   │   └── console/     # Admin console pages
│   ├── components/       # Dashboard components
│   │   ├── ui/          # Reusable UI components
│   │   └── ...
│   └── lib/             # Server actions & utilities
│
├── server/               # Backend API server
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── models/      # Database models
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Custom middlewares
│   │   ├── utils/       # Helper functions
│   │   ├── service/     # External services (Cloudinary, Email)
│   │   └── app.js       # Express app setup
│   ├── index.js         # Server entry point
│   └── package.json
│
└── README.md            # This file
```

---

## 🗄️ Database Design

### Database Type
**PostgreSQL** - A powerful, open-source relational database management system.

### Database Collections (Tables)

#### 1. **users** Table
Stores user accounts for authentication and authorization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(100) | User's full name |
| `email` | VARCHAR(100) UNIQUE | User's email address (unique) |
| `password` | TEXT | Hashed password (BCrypt) |
| `role` | VARCHAR(20) | User role: 'admin' or 'writer' (default: 'admin') |
| `status` | VARCHAR(20) | Account status: 'pending' or 'active' (default: 'pending') |
| `created_at` | TIMESTAMP | Account creation timestamp |

**Relationships:**
- No direct foreign key relationships
- Used for authentication and authorization

---

#### 2. **categories** Table
Stores blog post categories for content organization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique category identifier |
| `name` | VARCHAR(100) UNIQUE | Category name (unique) |
| `slug` | VARCHAR(200) UNIQUE | URL-friendly category identifier |
| `created_at` | TIMESTAMP | Category creation timestamp |

**Relationships:**
- Referenced by `posts.category_id` (Foreign Key)

---

#### 3. **posts** Table
Stores blog posts with comprehensive metadata and SEO fields.

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique post identifier |
| `title` | VARCHAR(200) | Post title |
| `slug` | VARCHAR(250) UNIQUE | URL-friendly post identifier |
| `content` | TEXT | Main post content (HTML) |
| `excerpt` | VARCHAR(300) | Short post summary |
| `featured_image_url` | TEXT | URL of featured image |
| `featured_image_public_id` | VARCHAR(255) | Cloudinary public ID |
| `featured_image_alt` | VARCHAR(255) | Image alt text for SEO |
| `featured_image_caption` | VARCHAR(255) | Image caption |
| `meta_title` | TEXT | SEO meta title |
| `meta_description` | TEXT | SEO meta description |
| `meta_keywords` | TEXT[] | Array of SEO keywords |
| `canonical_url` | TEXT | Canonical URL for SEO |
| `schema_type` | VARCHAR(100) | Schema.org type (default: 'Article') |
| `category_id` | INTEGER | Foreign key to categories table |
| `tags` | TEXT[] | Array of post tags |
| `read_time` | INTEGER | Estimated reading time in minutes |
| `likes` | INTEGER | Number of likes (default: 0) |
| `comments` | JSONB | Array of comment objects |
| `interactions` | JSONB | Array of interaction tracking data |
| `is_published` | BOOLEAN | Publication status (default: false) |
| `published_at` | TIMESTAMP | Publication timestamp |
| `created_at` | TIMESTAMP | Post creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Relationships:**
- `category_id` → `categories.id` (Foreign Key)

**Comment Structure (JSONB):**
```json
[
  {
    "id": "unique_comment_id",
    "author": "User Name",
    "message": "Comment text",
    "status": "pending" | "approved",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

#### 4. **newsletters** Table
Stores newsletter subscription emails.

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique subscription identifier |
| `email` | VARCHAR(100) UNIQUE | Subscriber email address (unique) |
| `created_at` | TIMESTAMP | Subscription timestamp |

**Relationships:**
- No foreign key relationships

---

### Database Relationships Diagram

```
users
  │
  │ (no direct FK)
  │
posts ──────┐
  │         │
  │         │
  └─→ category_id → categories
```

---

## 🔐 Authentication & Authorization Flow

### Authentication Process

1. **Registration**
   - User submits registration form with name, email, password, and role
   - Password is hashed using BCrypt (10 rounds)
   - User is created with `status: 'pending'`
   - Admin must activate the account before login

2. **Login**
   - User submits email and password
   - System checks if user exists and status is 'active'
   - Password is verified against hashed password
   - JWT token is generated and sent as HTTP-only cookie
   - Token contains: `{ id, email, role }`

3. **Token Verification**
   - Protected routes check for JWT token in:
     - Cookie: `token`
     - Authorization header: `Bearer <token>`
   - Token is verified using `JWT_SECRET`
   - User information is attached to `req.user`

### Authorization Levels

- **Admin** (`role: 'admin'`)
  - Full access to all endpoints
  - Can create, update, delete posts
  - Can manage categories
  - Can activate/delete pending users
  - Can approve/reject comments
  - Can view analytics

- **Writer** (`role: 'writer'`)
  - Limited access (future implementation)
  - Can create posts (pending approval)
  - Cannot manage users or settings

- **Public** (No authentication)
  - Can view published posts
  - Can subscribe to newsletter
  - Can add comments (pending approval)
  - Can like posts

### Middleware

- **`verifyAdmin`** - Ensures user is authenticated and has admin role
- **`verifyUserByRole`** - Verifies user has specific role (future use)

---

## 🔧 Environment Variables

### Server Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/blogdb

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (Image Upload)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Nodemailer (Email Service)
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASS=your_app_password
```

### Client Environment Variables

Create a `.env.local` file in the `client/` directory:

```env
NEXT_SERVER_API_URL=http://localhost:3000/api
```

### Dashboard Environment Variables

Create a `.env.local` file in the `dashboard/` directory:

```env
NEXT_SERVER_API_URL=http://localhost:3000/api
```

**Important Notes:**
- Never commit `.env` files to version control
- Use strong, unique values for `JWT_SECRET` in production
- Replace placeholder values with your actual credentials
- For production, use secure database URLs and HTTPS

---

## 🚀 How to Run the Project Locally

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Blog-project
```

#### 2. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE blogdb;

# Exit PostgreSQL
\q
```

#### 3. Set Up Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Copy the example above and fill in your values

# Initialize database tables (optional - tables are created automatically)
npm run seed

# Start the server
npm start
```

Server will run on: `http://localhost:3000`

#### 4. Set Up Client (Public Blog)

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_SERVER_API_URL=http://localhost:3000/api" > .env.local

# Start development server
npm run dev
```

Client will run on: `http://localhost:3001` (or next available port)

#### 5. Set Up Dashboard (Admin Panel)

```bash
# Navigate to dashboard directory
cd ../dashboard

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_SERVER_API_URL=http://localhost:3000/api" > .env.local

# Start development server
npm run dev
```

Dashboard will run on: `http://localhost:3002` (or next available port)

### Running All Services

You'll need **three terminal windows**:

1. **Terminal 1** - Server: `cd server && npm start`
2. **Terminal 2** - Client: `cd client && npm run dev`
3. **Terminal 3** - Dashboard: `cd dashboard && npm run dev`

### First-Time Setup Checklist

- [ ] PostgreSQL database created
- [ ] Server `.env` file configured
- [ ] Client `.env.local` file configured
- [ ] Dashboard `.env.local` file configured
- [ ] All dependencies installed
- [ ] Server is running
- [ ] Client is running
- [ ] Dashboard is running
- [ ] Create first admin user via `/api/auth/register`

---

## 📚 API Documentation

For detailed API documentation, see: [`server/README.md`](./server/README.md)

**Quick API Overview:**
- Base URL: `http://localhost:3000/api`
- Authentication: JWT tokens (HTTP-only cookies or Bearer token)
- Response Format: JSON

**Main Endpoints:**
- `/api/auth/*` - Authentication endpoints
- `/api/post/*` - Blog post endpoints
- `/api/category/*` - Category endpoints
- `/api/newsletter-subscribe` - Newsletter subscription

---

## 🔮 Future Improvements

Based on the project structure and `IMPROVE.md`, here are planned enhancements:

### Security Enhancements
- [ ] **Rate Limiting** - Prevent brute force attacks on login/signup
- [ ] **XSS Protection** - Sanitize user input (blog content, comments)
- [ ] **CSRF Protection** - Add CSRF tokens for sensitive operations
- [ ] **Input Validation** - Comprehensive validation middleware

### SEO & Performance
- [ ] **robots.txt** - Configure search engine crawling rules
- [ ] **sitemap.xml** - Auto-generate sitemap for published posts
- [ ] **Image Optimization** - Lazy loading and responsive images
- [ ] **Caching** - Implement Redis caching for frequently accessed data

### Content Management
- [ ] **Draft System** - Save posts as drafts before publishing
- [ ] **Scheduled Publishing** - Publish posts at specific dates/times
- [ ] **Post Approval System** - Admin approval for writer-submitted posts
- [ ] **Version History** - Track post edit history
- [ ] **Rich Text Editor** - Enhanced editor with more formatting options

### User Features
- [ ] **User Profiles** - Public user profiles with bio and avatar
- [ ] **Bookmarking** - Save favorite posts
- [ ] **Reading History** - Track read posts
- [ ] **Search Functionality** - Full-text search across posts
- [ ] **Tag Filtering** - Filter posts by tags

### Analytics & Insights
- [ ] **Post Analytics** - View counts, engagement metrics
- [ ] **User Analytics** - Track user behavior
- [ ] **Dashboard Charts** - Visualize data with charts
- [ ] **Export Data** - Export posts, subscribers, etc.

### Communication
- [ ] **Email Notifications** - Notify subscribers of new posts
- [ ] **Comment Notifications** - Email notifications for comment replies
- [ ] **Newsletter Campaigns** - Send newsletters to subscribers

### Technical Improvements
- [ ] **API Documentation** - Swagger/OpenAPI documentation
- [ ] **Unit Tests** - Test coverage for critical functions
- [ ] **Integration Tests** - End-to-end API testing
- [ ] **Error Logging** - Centralized error logging (e.g., Sentry)
- [ ] **Database Migrations** - Proper migration system
- [ ] **Docker Support** - Containerize the application

---

## 📖 Additional Resources

- **Server API Documentation**: [`server/README.md`](./server/README.md)
- **Improvement Checklist**: [`IMPROVE.md`](./IMPROVE.md)

---

## 👨‍💻 Author

**Masaud Ahmod**  
MERN Stack Developer  
Passionate about building production-grade applications 🚀

---

## 📄 License

ISC

---

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Happy Coding! 🎉**
