# 📝 Blog Backend API Documentation

A comprehensive RESTful API backend for a Blog Application built with **Node.js**, **Express.js**, and **PostgreSQL**. This API provides endpoints for authentication, blog post management, category management, newsletter subscriptions, and more.

---

## 🚀 Server Overview

### Tech Stack
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL** - Relational database (using `pg` library)
- **JWT (JSON Web Tokens)** - Authentication mechanism
- **BCrypt** - Password hashing (10 rounds)
- **Cloudinary** - Image upload and management
- **Nodemailer** - Email service for newsletters
- **Multer** - File upload middleware
- **Cookie Parser** - Cookie management
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Server Connection to Database

The server connects to PostgreSQL using a connection pool:

```javascript
// server/src/config/db.js
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

**Connection Details:**
- Uses connection pooling for efficient database connections
- SSL enabled for secure connections
- Connection string provided via `DATABASE_URL` environment variable
- Automatic error handling and connection management

### Middleware Usage

#### 1. **Built-in Express Middleware**
- `express.json()` - Parses JSON request bodies
- `express.urlencoded({ extended: true })` - Parses URL-encoded bodies
- `cookie-parser` - Parses cookies from request headers

#### 2. **Custom Middleware**

**Authentication Middleware** (`auth.middleware.js`):
- `verifyAdmin` - Verifies JWT token and ensures user has admin role
- `verifyUserByRole(role)` - Verifies user has specific role (future use)

**File Upload Middleware** (`multer.middleware.js`):
- `upload.single("featured_image")` - Handles single image file uploads
- Files are temporarily stored before Cloudinary upload

#### 3. **Route Middleware**
- Applied to specific routes that require authentication
- Example: `router.post("/add", verifyAdmin, upload.single("featured_image"), addPost)`

---

## 🌐 API Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://yourdomain.com/api`

All endpoints are prefixed with `/api`

---

## 📋 API Endpoints

---

## 🔐 Authentication APIs

### 1. Register Admin

**Endpoint:** `POST /api/auth/register`

**Purpose:** Create a new admin account (first-time setup).

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response - Success (201):**
```json
{
  "message": "Admin registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response - Error (400):**
```json
{
  "message": "All fields are required"
}
```

**Response - Error (400):**
```json
{
  "message": "Email already exists"
}
```

---

### 2. Register User (Writer/Editor)

**Endpoint:** `POST /api/auth/register-user`

**Purpose:** Register a new user (writer/editor) with pending status. Requires admin approval.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "name": "Jane Writer",
  "email": "writer@example.com",
  "password": "securePassword123",
  "role": "writer"
}
```

**Response - Success (201):**
```json
{
  "message": "Registration successful. Please wait for admin confirmation."
}
```

**Response - Error (400):**
```json
{
  "message": "All fields are required"
}
```

**Response - Error (400):**
```json
{
  "message": "Email already exists"
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate user and receive JWT token.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response - Success (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response - Error (400):**
```json
{
  "message": "All fields are required"
}
```

**Response - Error (400):**
```json
{
  "message": "User not found"
}
```

**Response - Error (400):**
```json
{
  "message": "Invalid Password"
}
```

**Response - Error (403):**
```json
{
  "message": "Your account is not active yet. Please wait for admin approval."
}
```

**Note:** Token is also set as HTTP-only cookie named `token`.

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Purpose:** Get currently authenticated user information.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```
OR
```
Cookie: token=<token>
```

**Response - Success (200):**
```json
{
  "message": "Current user",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Purpose:** Logout user and clear authentication cookie.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response - Success (200):**
```json
{
  "message": "Logout successful"
}
```

---

### 6. Get Pending Users

**Endpoint:** `GET /api/auth/pending-user`

**Purpose:** Get list of users waiting for admin approval.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response - Success (200):**
```json
{
  "message": "Pending users",
  "users": [
    {
      "id": 2,
      "name": "Jane Writer",
      "email": "writer@example.com",
      "role": "writer"
    }
  ]
}
```

---

### 7. Activate User

**Endpoint:** `POST /api/auth/pending-user/:id`

**Purpose:** Activate a pending user account (change status to 'active').

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - User ID to activate

**Response - Success (200):**
```json
{
  "message": "User activated successfully"
}
```

**Response - Error (400):**
```json
{
  "message": "User ID is required"
}
```

**Response - Error (404):**
```json
{
  "message": "User not found"
}
```

---

### 8. Delete User

**Endpoint:** `DELETE /api/auth/pending-user/:id`

**Purpose:** Delete a pending user account.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - User ID to delete

**Response - Success (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Response - Error (404):**
```json
{
  "message": "User not found"
}
```

---

## 📝 Blog/Post APIs

### 1. Create Post

**Endpoint:** `POST /api/post/add`

**Purpose:** Create a new blog post with optional featured image.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "My First Blog Post"
slug: "my-first-blog-post" (optional, auto-generated if not provided)
content: "<p>Blog post content in HTML...</p>"
excerpt: "Short summary of the post"
featured_image: [File] (optional)
featured_image_alt: "Image description"
featured_image_caption: "Image caption"
meta_title: "SEO Meta Title"
meta_description: "SEO meta description"
meta_keywords: "keyword1, keyword2, keyword3" (comma-separated)
canonical_url: "https://example.com/post-url"
schema_type: "Article" (default)
category_id: 1
tags: "tag1, tag2, tag3" (comma-separated)
read_time: 5
is_published: true/false
published_at: "2025-01-15T10:30:00Z" (optional)
```

**Response - Success (201):**
```json
{
  "message": "Post created",
  "post": {
    "id": 1,
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "<p>Blog post content...</p>",
    "featured_image_url": "https://res.cloudinary.com/...",
    "category_id": 1,
    "is_published": true,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (400):**
```json
{
  "message": "Missing required fields"
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized Token"
}
```

---

### 2. Get All Posts

**Endpoint:** `GET /api/post`

**Purpose:** Get paginated list of all blog posts with category information.

**Authentication Required:** ❌ No

**Query Parameters:**
- `page` (optional) - Page number (default: 1)

**Example:** `GET /api/post?page=1`

**Response - Success (200):**
```json
{
  "message": "Posts retrieved",
  "currentPage": 1,
  "totalPages": 5,
  "posts": [
    {
      "id": 1,
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "content": "<p>Blog post content...</p>",
      "excerpt": "Short summary",
      "featured_image_url": "https://res.cloudinary.com/...",
      "category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "likes": 10,
      "is_published": true,
      "published_at": "2025-01-15T10:30:00Z",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Response - Error (500):**
```json
{
  "message": "Server Error",
  "error": "Error message"
}
```

---

### 3. Get Post by ID

**Endpoint:** `GET /api/post/id/:id`

**Purpose:** Get a single blog post by its ID.

**Authentication Required:** ❌ No

**URL Parameters:**
- `id` - Post ID

**Response - Success (200):**
```json
{
  "message": "Post retrieved",
  "post": {
    "id": 1,
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "<p>Blog post content...</p>",
    "category_id": 1,
    "tags": ["tag1", "tag2"],
    "likes": 10,
    "comments": [],
    "is_published": true,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

---

### 4. Get Post by Slug

**Endpoint:** `GET /api/post/slug/:slug`

**Purpose:** Get a single blog post by its URL-friendly slug.

**Authentication Required:** ❌ No

**URL Parameters:**
- `slug` - Post slug (URL-friendly identifier)

**Example:** `GET /api/post/slug/my-first-blog-post`

**Response - Success (200):**
```json
{
  "message": "Post retrieved",
  "post": {
    "id": 1,
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "<p>Blog post content...</p>",
    "category_id": 1,
    "likes": 10,
    "is_published": true
  }
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

---

### 5. Delete Post

**Endpoint:** `DELETE /api/post/id/:id`

**Purpose:** Delete a blog post and its associated Cloudinary image.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Post ID to delete

**Response - Success (200):**
```json
{
  "message": "Post deleted"
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized Token"
}
```

---

### 6. Like Post

**Endpoint:** `POST /api/post/:slug/like`

**Purpose:** Increment the like count for a post.

**Authentication Required:** ❌ No

**URL Parameters:**
- `slug` - Post slug

**Response - Success (200):**
```json
{
  "likes": 11
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

---

### 7. Unlike Post

**Endpoint:** `POST /api/post/:slug/unlike`

**Purpose:** Decrement the like count for a post (minimum 0).

**Authentication Required:** ❌ No

**URL Parameters:**
- `slug` - Post slug

**Response - Success (200):**
```json
{
  "likes": 10
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

---

### 8. Get Monthly Post Statistics

**Endpoint:** `GET /api/post/monthly-stats`

**Purpose:** Get statistics for posts created in a specific month.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (required) - Month number (1-12)
- `year` (required) - Year (e.g., 2025)

**Example:** `GET /api/post/monthly-stats?month=1&year=2025`

**Response - Success (200):**
```json
{
  "message": "Monthly post stats retrieved",
  "data": {
    "total_posts": 15,
    "total_likes": 250,
    "total_comments": 45
  }
}
```

**Response - Error (404):**
```json
{
  "message": "Monthly post not found"
}
```

---

## 💬 Comment APIs

### 1. Add Comment

**Endpoint:** `POST /api/post/comment/:id`

**Purpose:** Add a comment to a blog post (status: pending, requires admin approval).

**Authentication Required:** ❌ No

**URL Parameters:**
- `id` - Post ID

**Request Body:**
```json
{
  "userName": "John Doe",
  "message": "Great article! Very informative."
}
```

**Response - Success (200):**
```json
{
  "message": "Comment added"
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

**Note:** Comments are stored as JSONB array in the posts table. New comments have `status: "pending"` until approved by admin.

---

### 2. Get Pending Comments

**Endpoint:** `GET /api/post/comments/pending`

**Purpose:** Get all comments with pending status across all posts.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response - Success (200):**
```json
{
  "message": "Pending comments retrieved",
  "comments": [
    {
      "id": 1,
      "title": "My First Blog Post",
      "pending_comments": [
        {
          "id": "abc123",
          "author": "John Doe",
          "message": "Great article!",
          "status": "pending",
          "created_at": "2025-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

**Response - Error (404):**
```json
{
  "message": "No pending comments found"
}
```

---

### 3. Approve Comment

**Endpoint:** `POST /api/post/comments/pending`

**Purpose:** Approve a pending comment (change status to 'approved').

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `postId` (required) - Post ID containing the comment
- `commentId` (required) - Comment ID to approve

**Example:** `POST /api/post/comments/pending?postId=1&commentId=abc123`

**Response - Success (200):**
```json
{
  "message": "Comment approved"
}
```

**Response - Error (404):**
```json
{
  "message": "Post not found"
}
```

---

## 🏷️ Category APIs

### 1. Create Category

**Endpoint:** `POST /api/category/add`

**Purpose:** Create a new blog category.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Technology",
  "slug": "technology" (optional, auto-generated if not provided)
}
```

**Response - Success (201):**
```json
{
  "message": "Category created",
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (400):**
```json
{
  "message": "Category name is required"
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized Token"
}
```

---

### 2. Get All Categories

**Endpoint:** `GET /api/category`

**Purpose:** Get list of all categories.

**Authentication Required:** ❌ No

**Response - Success (200):**
```json
{
  "message": "Categories retrieved",
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Lifestyle",
      "slug": "lifestyle",
      "created_at": "2025-01-16T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Category by ID

**Endpoint:** `GET /api/category/:id`

**Purpose:** Get a single category by its ID.

**Authentication Required:** ❌ No

**URL Parameters:**
- `id` - Category ID

**Response - Success (200):**
```json
{
  "message": "Category retrieved",
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (404):**
```json
{
  "message": "Category not found"
}
```

---

### 4. Update Category

**Endpoint:** `PUT /api/category/update/:id`

**Purpose:** Update an existing category.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Category ID

**Request Body:**
```json
{
  "name": "Tech & Innovation",
  "slug": "tech-innovation"
}
```

**Response - Success (200):**
```json
{
  "message": "Category updated",
  "category": {
    "id": 1,
    "name": "Tech & Innovation",
    "slug": "tech-innovation",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized Token"
}
```

---

### 5. Delete Category

**Endpoint:** `DELETE /api/category/:id`

**Purpose:** Delete a category.

**Authentication Required:** ✅ Yes (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Category ID

**Response - Success (200):**
```json
{
  "message": "Category deleted"
}
```

**Response - Error (401):**
```json
{
  "message": "Unauthorized Token"
}
```

---

## 📧 Newsletter APIs

### 1. Subscribe to Newsletter

**Endpoint:** `POST /api/newsletter-subscribe`

**Purpose:** Subscribe an email address to the newsletter.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response - Success (201):**
```json
{
  "message": "Thank you for subscribing! You will receive a confirmation email.",
  "data": {
    "id": 1,
    "email": "subscriber@example.com",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response - Error (400):**
```json
{
  "message": "Email is required"
}
```

**Response - Error (409):**
```json
{
  "message": "This Email is already subscribed!"
}
```

**Note:** A welcome email is automatically sent to the subscriber.

---

### 2. Unsubscribe from Newsletter

**Endpoint:** `DELETE /api/newsletter-unsubscribe`

**Purpose:** Remove an email from the newsletter subscription list.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response - Success (200):**
```json
{
  "message": "Unsubscribed successfully"
}
```

**Response - Error (400):**
```json
{
  "message": "Email is required"
}
```

**Response - Error (404):**
```json
{
  "message": "Email not found"
}
```

---

### 3. Get All Newsletter Subscribers

**Endpoint:** `GET /api/newsletter-subscribe`

**Purpose:** Get paginated list of all newsletter subscribers (admin use).

**Authentication Required:** ❌ No (but should be protected in production)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example:** `GET /api/newsletter-subscribe?page=1&limit=10`

**Response - Success (200):**
```json
{
  "total": 100,
  "currentPage": 1,
  "totalPages": 10,
  "data": [
    {
      "id": 1,
      "email": "subscriber@example.com",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🔒 Authentication Methods

The API supports two methods for sending authentication tokens:

### Method 1: HTTP-Only Cookie
Token is automatically sent with requests if using the same domain:
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 2: Bearer Token (Authorization Header)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Priority:** The middleware checks cookies first, then Authorization header.

---

## 📊 Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE requests |
| 201 | Created | Successful POST requests (resource created) |
| 400 | Bad Request | Invalid request data or missing fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server-side error |

---

## 🛠️ Error Response Format

All error responses follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "Technical error details (optional)"
}
```

---

## 📝 Notes

1. **Image Uploads**: Featured images are uploaded to Cloudinary. The public ID is stored for future deletion.

2. **Comments**: Comments are stored as JSONB arrays within the posts table. Each comment has a unique ID, author, message, status, and timestamp.

3. **Slug Generation**: If a slug is not provided, it's auto-generated from the title by:
   - Converting to lowercase
   - Replacing spaces with hyphens
   - Removing special characters

4. **Password Security**: All passwords are hashed using BCrypt with 10 salt rounds before storage.

5. **Token Expiration**: JWT tokens should include expiration time (configured in `utils/jwt.js`).

6. **Pagination**: List endpoints support pagination via `page` query parameter (default: 10 items per page).

---

## 🚀 Getting Started

See the main [README.md](../README.md) for setup instructions.

---

## 📚 Additional Resources

- **Main Project README**: [`../README.md`](../README.md)
- **Postman API Collection**: [Link to Postman documentation](https://documenter.getpostman.com/view/38227871/2sB3dMyWmj)

---

## 👨‍💻 Author

**Masaud Ahmod**  
MERN Stack Developer

---

**Happy Coding! 🎉**
