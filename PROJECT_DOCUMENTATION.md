# 📚 Blog Project - How It Works

A simple guide explaining how this blog platform works from top to bottom.

---

## 🎯 What Is This Project?

This is a **full-stack blog platform** that allows you to:
- **Read blog posts** on a beautiful public website
- **Manage content** through an admin dashboard
- **Interact** with posts through comments and likes
- **Subscribe** to newsletters for updates

Think of it like WordPress, but built from scratch with modern technologies.

---

## 🏗️ Project Structure (The Big Picture)

The project is split into **3 main applications** that work together:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │  Dashboard  │         │   Server    │
│  (Public)   │───────▶ │  (Admin)    │───────▶│   (API)     │
│             │         │             │         │             │
│ Next.js     │         │ Next.js     │         │ Express.js  │
│ Port 3001   │         │ Port 4000   │         │ Port 3000   │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │ PostgreSQL  │
                                                │  Database   │
                                                └─────────────┘
```

### 1. **Client** (Public Blog Website)
- **What it does**: The website visitors see
- **Technology**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Location**: `client/` folder
- **Runs on**: `http://localhost:3001`

**Key Pages:**
- Home page (`/`) - Shows featured posts and latest articles
- Blog listing (`/blog`) - Lists all published posts
- Blog post (`/blog/[slug]`) - Individual post page with comments
- Categories (`/categories`) - Browse posts by category
- About (`/about`) - About page

**How it works:**
- Fetches data from the Server API
- Displays blog posts, categories, and comments
- Allows visitors to like posts and add comments
- Handles newsletter subscriptions

---

### 2. **Dashboard** (Admin Panel)
- **What it does**: Content management system for admins
- **Technology**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + TinyMCE
- **Location**: `dashboard/` folder
- **Runs on**: `http://localhost:4000`

**Key Features:**
- **Login/Register** - Admin authentication
- **Posts Management** - Create, edit, delete, publish posts
- **Categories** - Manage blog categories
- **Comments** - Approve/reject comments
- **Newsletter** - View subscribers
- **Site Content** - Manage homepage content (CMS)
- **Analytics** - View post statistics

**How it works:**
- Admins log in with email/password
- Uses JWT tokens for authentication
- Sends requests to Server API to manage content
- Uses TinyMCE rich text editor for post content

---

### 3. **Server** (Backend API)
- **What it does**: Handles all backend logic and database operations
- **Technology**: Node.js + Express.js 5 + PostgreSQL
- **Location**: `server/` folder
- **Runs on**: `http://localhost:3000`

**Key Responsibilities:**
- **Authentication** - Login, register, JWT token management
- **Posts** - CRUD operations for blog posts
- **Categories** - Manage categories
- **Comments** - Store and manage comments
- **Likes** - Track post likes
- **Newsletter** - Handle subscriptions
- **Site Content** - CMS content management
- **File Uploads** - Image uploads via Cloudinary

**API Endpoints:**
- `/api/auth/*` - Authentication
- `/api/post/*` - Blog posts
- `/api/category/*` - Categories
- `/api/comments/*` - Comments
- `/api/likes/*` - Likes
- `/api/newsletter-subscribe` - Newsletter
- `/api/site-content/*` - CMS content

---

## 🔄 How Data Flows (Step by Step)

### Example: Reading a Blog Post

1. **Visitor visits** `/blog/my-post-title`
2. **Client** (Next.js) calls `getPostBySlug("my-post-title")` from `client/lib/action.ts`
3. **Client** sends HTTP request to `http://localhost:3000/api/post/slug/my-post-title`
4. **Server** receives request at `server/src/routes/post.routes.js`
5. **Server** calls `getPostBySlug()` controller in `server/src/controllers/post.controller.js`
6. **Controller** queries PostgreSQL database: `SELECT * FROM posts WHERE slug = 'my-post-title'`
7. **Database** returns post data
8. **Server** sends JSON response back to Client
9. **Client** receives data and displays it on the page

### Example: Creating a Post (Admin)

1. **Admin logs in** via Dashboard
2. **Dashboard** stores JWT token in cookies
3. **Admin fills form** with post title, content, category, etc.
4. **Dashboard** sends POST request to `/api/post/add` with:
   - Form data (title, content, etc.)
   - Image file (if uploaded)
   - JWT token in cookie/header
5. **Server** verifies JWT token (authentication middleware)
6. **Server** checks if user has "admin" role (authorization middleware)
7. **Server** uploads image to Cloudinary (if provided)
8. **Server** saves post to PostgreSQL database
9. **Server** returns success response
10. **Dashboard** shows success message and refreshes post list

---

## 🗄️ Database Structure

The project uses **PostgreSQL** (relational database) with these main tables:

### **users**
Stores admin/writer accounts
- `id`, `name`, `email`, `password` (hashed), `role`, `status`

### **categories**
Blog post categories
- `id`, `name`, `slug`

### **posts**
Blog posts (main content)
- `id`, `title`, `slug`, `content` (HTML), `category_id`
- `featured_image_url`, `meta_title`, `meta_description` (SEO)
- `is_published`, `published_at`, `likes`, `comments` (JSONB)
- `created_at`, `updated_at`

### **comments**
Post comments (separate table)
- `id`, `post_id`, `user_identifier`, `message`, `status` (pending/approved)
- `created_at`

### **post_likes**
Tracks who liked which posts
- `id`, `post_id`, `user_identifier`, `created_at`

### **newsletters**
Newsletter subscribers
- `id`, `email`, `created_at`

### **site_contents**
CMS content for pages (homepage sections, etc.)
- `id`, `page_key`, `section_key`, `content` (JSONB), `image_url`
- `created_at`, `updated_at`

---

## 🔐 Authentication & Security

### How Login Works:

1. **User enters** email and password in Dashboard
2. **Dashboard** sends POST to `/api/auth/login`
3. **Server** checks if user exists and password matches (using BCrypt)
4. **Server** checks if user status is "active"
5. **Server** creates JWT token containing: `{ id, email, role }`
6. **Server** sends token as HTTP-only cookie
7. **Dashboard** stores token and redirects to admin panel

### Protected Routes:

- **Middleware** (`server/src/middlewares/auth.middleware.js`) checks:
  - Is token valid?
  - Is user authenticated?
  - Does user have required role? (admin/writer)

### Password Security:

- Passwords are **hashed** using BCrypt (10 rounds)
- Never stored in plain text
- Original password cannot be recovered (only reset)

---

## 📝 Content Management System (CMS)

The project includes a **CMS** for managing homepage content without code changes.

### How CMS Works:

1. **Admin** goes to Dashboard → Site Content
2. **Admin** creates/edits content for different sections:
   - `page_key`: "home" (which page)
   - `section_key`: "hero", "latest", "trending", etc. (which section)
   - `content`: JSON object with title, description, etc.
   - `image_url`: Optional image

3. **Content stored** in `site_contents` table

4. **Client** fetches content:
   ```typescript
   const siteContent = await getSiteContentByPageKey("home");
   const heroContent = siteContent.contents.find(item => item.section_key === "hero");
   ```

5. **Client** displays content dynamically:
   ```tsx
   <h1>{heroContent.content.title || "Default Title"}</h1>
   ```

**Benefits:**
- Change homepage content without deploying code
- Manage multiple pages (home, about, etc.)
- Support for images and rich content

---

## 🖼️ Image Handling

### How Images Work:

1. **Admin uploads** image via Dashboard (post featured image or CMS image)
2. **Server** receives image via Multer middleware
3. **Server** uploads to **Cloudinary** (cloud image hosting)
4. **Cloudinary** returns:
   - `url` - Optimized image URL
   - `public_id` - ID for future deletion
5. **Server** saves URL and public_id to database
6. **Client** displays image using the URL

### Why Cloudinary?

- Automatic image optimization
- Responsive images
- CDN delivery (fast loading)
- Easy deletion when post is deleted

---

## 💬 Comments System

### How Comments Work:

1. **Visitor** adds comment on a post
2. **Client** sends POST to `/api/comments` with:
   - `post_id`
   - `user_identifier` (browser fingerprint, not login required)
   - `message`
3. **Server** creates comment with `status: "pending"`
4. **Admin** sees pending comment in Dashboard
5. **Admin** approves/rejects comment
6. **Server** updates comment status to "approved"
7. **Client** only shows approved comments on public site

**Note:** Comments are stored in a separate `comments` table (not JSONB in posts anymore).

---

## ❤️ Likes System

### How Likes Work:

1. **Visitor** clicks like button
2. **Client** sends POST to `/api/likes` with:
   - `post_id`
   - `user_identifier` (browser fingerprint)
3. **Server** checks if user already liked (prevents double-liking)
4. **Server** creates entry in `post_likes` table
5. **Server** increments `likes` count in `posts` table
6. **Client** updates UI to show new like count

**Note:** Uses browser fingerprinting (not login) so anyone can like.

---

## 📧 Newsletter System

### How Newsletter Works:

1. **Visitor** enters email in newsletter form
2. **Client** sends POST to `/api/newsletter-subscribe`
3. **Server** checks if email already exists
4. **Server** saves email to `newsletters` table
5. **Server** sends confirmation email (via Nodemailer)
6. **Admin** can view all subscribers in Dashboard

**Future:** Admin can send newsletters to all subscribers.

---

## 🎨 Frontend Architecture

### Client (Public Blog)

**Component Structure:**
```
client/
├── app/                    # Next.js pages (routing)
│   ├── page.tsx           # Home page
│   ├── blog/              # Blog pages
│   └── categories/        # Category pages
├── components/            # Reusable components
│   ├── Navbar.tsx
│   ├── Pagination.tsx
│   └── pages/home/        # Home page components
│       ├── Hero.tsx       # Featured story section
│       ├── Latest.tsx    # Latest posts section
│       └── Footer.tsx
└── lib/
    └── action.ts          # Server actions (API calls)
```

**Key Features:**
- **Server Components** - Fetch data on server (faster)
- **Client Components** - Interactive parts (buttons, forms)
- **Dark Mode** - Theme switching with next-themes
- **Responsive** - Mobile-first design with Tailwind CSS

### Dashboard (Admin Panel)

**Component Structure:**
```
dashboard/
├── app/
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── console/          # Admin pages
│       ├── posts/        # Post management
│       ├── categories/   # Category management
│       ├── comments/     # Comment approval
│       └── site-content/ # CMS
├── components/
│   ├── ui/               # Reusable UI components (Radix UI)
│   └── ContentEditor.tsx # TinyMCE editor
└── lib/
    └── action.ts         # Server actions
```

**Key Features:**
- **Rich Text Editor** - TinyMCE for post content
- **Data Tables** - Sortable, filterable tables
- **Charts** - Analytics visualization (Recharts)
- **Drag & Drop** - Reorder content (dnd-kit)

---

## 🔧 Key Technologies Explained

### **Next.js**
- React framework with server-side rendering
- Automatic code splitting
- File-based routing (`app/` directory)
- Server Components (fetch data on server)

### **Express.js**
- Web server framework for Node.js
- Handles HTTP requests/responses
- Middleware system (auth, error handling)
- RESTful API design

### **PostgreSQL**
- Relational database (tables with relationships)
- SQL queries for data operations
- JSONB support (store JSON in database)
- ACID compliance (data integrity)

### **JWT (JSON Web Tokens)**
- Secure way to authenticate users
- Token contains user info (id, email, role)
- Sent as HTTP-only cookie (secure)
- Expires after set time

### **Cloudinary**
- Cloud image hosting service
- Automatic optimization and CDN
- API for upload/delete operations

### **TinyMCE**
- Rich text editor (like WordPress editor)
- WYSIWYG (What You See Is What You Get)
- Generates HTML from formatted text

---

## 🚀 How to Run the Project

### Prerequisites:
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Steps:

1. **Set up Database:**
   ```bash
   # Create PostgreSQL database
   createdb blogdb
   ```

2. **Set up Server:**
   ```bash
   cd server
   npm install
   # Create .env file with database URL, JWT_SECRET, Cloudinary keys
   npm start
   ```

3. **Set up Client:**
   ```bash
   cd client
   npm install
   # Create .env.local with NEXT_SERVER_API_URL=http://localhost:3000/api
   npm run dev
   ```

4. **Set up Dashboard:**
   ```bash
   cd dashboard
   npm install
   # Create .env.local with NEXT_SERVER_API_URL=http://localhost:3000/api
   npm run dev
   ```

5. **Access:**
   - Client: http://localhost:3001
   - Dashboard: http://localhost:4000
   - Server API: http://localhost:3000/api

---

## 📊 Data Flow Examples

### Creating a Post:

```
Admin Dashboard
    ↓ (fills form)
Dashboard Component
    ↓ (POST /api/post/add + JWT token)
Express Server
    ↓ (verifies token)
Auth Middleware
    ↓ (checks admin role)
Post Controller
    ↓ (uploads image)
Cloudinary Service
    ↓ (saves to database)
PostgreSQL Database
    ↓ (returns success)
Post Controller
    ↓ (sends response)
Dashboard
    ↓ (shows success)
Admin sees new post
```

### Viewing a Post:

```
Visitor Browser
    ↓ (visits /blog/my-post)
Next.js Page Component
    ↓ (calls getPostBySlug)
Client Action (action.ts)
    ↓ (GET /api/post/slug/my-post)
Express Server
    ↓ (queries database)
PostgreSQL Database
    ↓ (returns post data)
Post Controller
    ↓ (sends JSON response)
Client Action
    ↓ (returns data)
Page Component
    ↓ (renders HTML)
Visitor sees post
```

---

## 🎯 Key Concepts

### **Server Actions** (`"use server"`)
- Functions that run on the server
- Called directly from React components
- Handle API calls securely
- Located in `lib/action.ts`

### **Middleware**
- Functions that run before route handlers
- Examples: Authentication, error handling, file uploads
- Located in `server/src/middlewares/`

### **Controllers**
- Handle business logic for routes
- Process requests and return responses
- Located in `server/src/controllers/`

### **Models**
- Database query functions
- Abstract SQL queries
- Located in `server/src/models/`

### **Routes**
- Define API endpoints
- Map URLs to controllers
- Located in `server/src/routes/`

---

## 🔍 Common Questions

### Q: Why three separate applications?
**A:** Separation of concerns:
- **Client** = Public-facing (can be deployed separately)
- **Dashboard** = Admin-only (different security needs)
- **Server** = Shared API (both use same backend)

### Q: How does authentication work?
**A:** JWT tokens stored as HTTP-only cookies. Server validates token on each request.

### Q: Can visitors create accounts?
**A:** Currently, only admins can register. Visitors can comment/like without accounts (using browser fingerprinting).

### Q: How are images stored?
**A:** Images are uploaded to Cloudinary (cloud service), not stored on the server. Only URLs are saved in the database.

### Q: What is CMS?
**A:** Content Management System - allows admins to edit homepage content without code changes.

### Q: How are comments moderated?
**A:** All comments start as "pending". Admins approve/reject them in the Dashboard.

---

## 📚 File Structure Summary

```
Blog-project/
├── client/              # Public blog website
│   ├── app/            # Pages (routing)
│   ├── components/    # React components
│   └── lib/           # API functions
├── dashboard/          # Admin panel
│   ├── app/           # Admin pages
│   ├── components/    # Dashboard components
│   └── lib/           # Admin API functions
└── server/            # Backend API
    ├── src/
    │   ├── config/    # Database setup
    │   ├── models/    # Database queries
    │   ├── controllers/ # Business logic
    │   ├── routes/    # API endpoints
    │   ├── middlewares/ # Auth, errors, etc.
    │   └── service/   # External services (Cloudinary, Email)
    └── index.js       # Server entry point
```

---

## 🎓 Learning Resources

If you want to understand the technologies better:

- **Next.js**: https://nextjs.org/docs
- **Express.js**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **JWT**: https://jwt.io/introduction
- **React**: https://react.dev/

---

## ✨ Summary

This blog platform is a **modern, full-stack application** that:
- Uses **Next.js** for fast, SEO-friendly frontends
- Uses **Express.js** for a robust REST API
- Uses **PostgreSQL** for reliable data storage
- Includes **authentication**, **CMS**, **image handling**, and **content moderation**

The architecture separates concerns (client, dashboard, server) for better maintainability and scalability.

---

**Happy Coding! 🚀**
