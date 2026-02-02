# 📝 Blog Backend API Documentation

A comprehensive RESTful API backend for a Blog Application built with **Node.js**, **Express.js 5**, and **PostgreSQL**. This API provides endpoints for authentication, blog post management, category management, comments (legacy JSONB and dedicated comments table), likes, newsletter subscriptions, activity logging, and site content management.

---

## 🚀 Server Overview

### Tech Stack
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL** - Relational database (using `pg` library)
- **Redis** - Caching (posts, comments, site content; optional, graceful fallback if unavailable)
- **JWT (JSON Web Tokens)** - Authentication mechanism
- **BCrypt** - Password hashing (10 rounds)
- **Cloudinary** - Image upload and management (posts, site content)
- **Nodemailer** - Email service for newsletters
- **Multer** - File upload middleware
- **CORS** / **Cookie-parser** - Available as dependencies (auth reads token from cookie/header manually)
- **Dotenv** - Environment variable management

### Server Connection to Database

The server connects to PostgreSQL using a connection pool:

```javascript
// server/src/config/db.js
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || isVercel ? { rejectUnauthorized: false } : false,
  max: isVercel ? 2 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

**Connection Details:**
- Uses connection pooling; smaller pool on Vercel/serverless
- SSL enabled in production
- Connection string via `DATABASE_URL`
- Optional `checkConnection()` helper for health checks

### Middleware Usage

#### 1. **Built-in Express Middleware**
- `express.json()` - Parses JSON request bodies
- `express.urlencoded({ extended: true })` - Parses URL-encoded bodies

#### 2. **Custom Middleware**

**Authentication** (`auth.middleware.js`):
- `verifyAuth` - Verifies JWT (cookie or `Authorization: Bearer`); attaches `req.user`
- `verifyAdmin` - Verifies JWT and ensures role is admin (deprecated; use `verifyAuth` + `allowRoles`)
- `allowRoles(...roles)` - Role-based access (e.g. `allowRoles("admin", "moderator")`)
- Use together: `verifyAuth, allowRoles("admin")` for protected routes

**File Upload** (`multer.middleware.js`):
- `upload.single("featured_image")` - Post featured image
- `upload.single("image")` - Site content image

**Error Handling** (`error.middleware.js`):
- `errorHandler` - Centralized error responses (JSON with `success: false`, `message`; optional `stack` in development)
- `asyncHandler` - Wraps async route handlers
- `AppError` - Custom error class with status code

#### 3. **Route Middleware**
- Applied per-route: e.g. `verifyAuth, allowRoles("admin")` or `verifyAdmin` on auth routes

---

## 🌐 API Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://yourdomain.com/api`

Root: `GET /` returns `"Welcome to the Journal Thoughts API"`.

All API endpoints are prefixed with `/api`.

---

## 📋 API Endpoints Summary

| Area        | Base Path           | Description                    |
|------------|---------------------|--------------------------------|
| Auth       | `/api/auth`         | Register, login, pending users |
| Categories | `/api/category`     | CRUD categories                |
| Posts      | `/api/post`         | Posts, comments (legacy), likes by slug, stats |
| Comments   | `/api/comments`     | Comments (dedicated table, threading) |
| Likes      | `/api/likes`        | Like/unlike by post_id + user_identifier |
| Newsletter | `/api`              | `/newsletter-subscribe`, `/newsletter-unsubscribe` |
| Activity   | `/api/activity`     | Log and query activity        |
| Site Content | `/api/site-content` | Page/section content CRUD      |

---

## 🔐 Authentication APIs

### 1. Register Admin

**Endpoint:** `POST /api/auth/register`

**Purpose:** Create the first admin account.

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

**Response - Error (400):** `{ "message": "All fields are required" }` or `{ "message": "Email already exists" }`

---

### 2. Register User (Writer/Editor)

**Endpoint:** `POST /api/auth/register-user`

**Purpose:** Register a writer/editor; account is pending until admin activates.

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

**Response - Error (400):** `{ "message": "All fields are required" }` or `{ "message": "Email already exists" }`

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate and receive JWT; token is also set in HTTP-only cookie.

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
  "user": { "id": 1, "name": "John Doe", "email": "admin@example.com", "role": "admin" }
}
```

**Response - Error (400):** `"All fields are required"` | `"User not found"` | `"Invalid Password"`  
**Response - Error (403):** `"Your account is not active yet. Please wait for admin approval."`

**Note:** Cookie `token` is set with `httpOnly`, `secure`, `sameSite: 'Strict'`.

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Purpose:** Return the authenticated user.

**Authentication Required:** ✅ Yes (verifyAdmin)

**Headers:** `Authorization: Bearer <token>` or `Cookie: token=<token>`

**Response - Success (200):**
```json
{
  "message": "Current user",
  "user": { "id": 1, "name": "John Doe", "email": "admin@example.com", "role": "admin" }
}
```

**Response - Error (401):** `{ "message": "Unauthorized" }`

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Purpose:** Clear the auth cookie.

**Authentication Required:** ✅ Yes (verifyAdmin)

**Response - Success (200):** `{ "message": "Logout successful" }`

---

### 6. Get Pending Users

**Endpoint:** `GET /api/auth/pending-user`

**Purpose:** List users with status `pending`.

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):**
```json
{
  "message": "Pending users",
  "users": [
    { "id": 2, "name": "Jane Writer", "email": "writer@example.com", "role": "writer" }
  ]
}
```

---

### 7. Activate User

**Endpoint:** `POST /api/auth/pending-user/:id`

**Purpose:** Set user status to active.

**Authentication Required:** ✅ Yes (Admin)

**URL Parameters:** `id` - User ID

**Response - Success (200):** `{ "message": "User activated successfully" }`  
**Response - Error (400):** `{ "message": "User ID is required" }`  
**Response - Error (404):** `{ "message": "User not found" }`

---

### 8. Delete User

**Endpoint:** `DELETE /api/auth/pending-user/:id`

**Purpose:** Delete a pending user.

**Authentication Required:** ✅ Yes (Admin)

**URL Parameters:** `id` - User ID

**Response - Success (200):** `{ "message": "User deleted successfully" }`  
**Response - Error (404):** `{ "message": "User not found" }`

---

## 📝 Blog/Post APIs

### 1. Create Post

**Endpoint:** `POST /api/post/add`

**Purpose:** Create a blog post with optional featured image.

**Authentication Required:** ✅ Yes (Admin)

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- `title`, `content`, `category_id` (required)
- `slug`, `excerpt`, `featured_image` (file), `featured_image_alt`, `featured_image_caption`
- `meta_title`, `meta_description`, `meta_keywords`, `canonical_url`, `schema_type`
- `tags` (comma-separated), `read_time`, `likes`, `comments`, `interactions`
- `is_published`, `published_at`, `updated_at`

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Post created",
  "post": { "id": 1, "title": "...", "slug": "...", ... }
}
```

**Response - Error (400):** `"Missing required fields: title, content, and category_id are required"`  
**Response - Error (401):** Unauthorized

---

### 2. Get All Posts

**Endpoint:** `GET /api/post`

**Purpose:** Paginated list of posts (with category, etc.).

**Authentication Required:** ❌ No

**Query Parameters:** `page` (optional, default 1)

**Response - Success (200):** `{ "message": "Posts retrieved", "currentPage", "totalPages", "posts": [...] }` (may include `source: "cache"`)

---

### 3. Get Posts by Category (Filter)

**Endpoint:** `GET /api/post/filter`

**Purpose:** Paginated posts filtered by category (ID or slug) and status.

**Authentication Required:** ❌ No

**Query Parameters:**
- `categoryId` or `categorySlug` (one required)
- `page`, `limit` (default 1, 10; max limit 50)
- `filter`: `all` | `published` | `draft` (default `all`)
- `includeStats`: `true` to include category stats and latest posts

**Example:** `GET /api/post/filter?categorySlug=technology&page=1&filter=published`

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "category": { "id": 1, "name": "Technology", "slug": "technology" },
  "pagination": { "currentPage": 1, "totalPages": 5, "totalPosts": 42, "limit": 10, "hasNextPage": true, "hasPrevPage": false },
  "posts": [...],
  "categoryStats": { "allCategories": [...], "latestPosts": [...] }
}
```
(Optional `categoryStats` when `includeStats=true`.)

---

### 4. Get Trending Posts

**Endpoint:** `GET /api/post/trending`

**Purpose:** Published posts ordered by `published_at` DESC (e.g. for sidebar).

**Authentication Required:** ❌ No

**Query Parameters:** `limit` (optional, default 5, max 10)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Trending posts retrieved",
  "posts": [ { "id": 1, "slug": "...", "title": "...", "published_at": "..." } ]
}
```

---

### 5. Get Pinned Post

**Endpoint:** `GET /api/post/pinned`

**Purpose:** Get the single pinned post (if any).

**Authentication Required:** ❌ No

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Pinned post retrieved",
  "post": { ... }
}
```
or `"No pinned post found"` with `post: null`.

---

### 6. Get Post by ID

**Endpoint:** `GET /api/post/id/:id`

**Purpose:** Single post by ID.

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "message": "Post retrieved", "post": { ... } }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 7. Get Post by Slug

**Endpoint:** `GET /api/post/slug/:slug`

**Purpose:** Single post by slug.

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "message": "Post retrieved", "post": { ... } }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 8. Update Post by Slug

**Endpoint:** `PUT /api/post/slug/:slug` or `PATCH /api/post/slug/:slug`

**Purpose:** Update post; optional featured image.

**Authentication Required:** ✅ Yes (Admin)

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**URL Parameters:** `slug` - Post slug

**Response - Success (200):** `{ "success": true, "message": "Post updated", "post": { ... } }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 9. Update Publish Status

**Endpoint:** `PATCH /api/post/:id/publish`

**Purpose:** Set post published/draft.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Request Body:** e.g. `{ "is_published": true }`

**Response - Success (200):** `{ "success": true, "message": "...", "post": { ... } }`

---

### 10. Pin / Unpin Post

**Endpoint:** `PATCH /api/post/:id/pin`

**Purpose:** Pin this post (unpins others); call again to unpin.

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):** `{ "success": true, "message": "Post pinned successfully" | "Post unpinned successfully", "post": { ... } }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 11. Delete Post

**Endpoint:** `DELETE /api/post/id/:id`

**Purpose:** Delete post and its Cloudinary featured image.

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):** `{ "message": "Post deleted" }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 12. Like Post (by slug)

**Endpoint:** `POST /api/post/:slug/like`

**Purpose:** Increment like count for post (legacy behavior by slug).

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "likes": 11 }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 13. Unlike Post (by slug)

**Endpoint:** `POST /api/post/:slug/unlike`

**Purpose:** Decrement like count (min 0).

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "likes": 10 }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 14. Add Comment (Legacy – JSONB on post)

**Endpoint:** `POST /api/post/comment/:id`

**Purpose:** Add a comment stored in the post’s `comments` JSONB (status `pending`).

**Authentication Required:** ❌ No

**URL Parameters:** `id` - Post ID

**Request Body:**
```json
{
  "userName": "John Doe",
  "message": "Great article!"
}
```

**Response - Success (200):** `{ "message": "Comment added" }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 15. Get Pending Comments (Legacy)

**Endpoint:** `GET /api/post/comments/pending`

**Purpose:** List posts that have pending comments (JSONB comments).

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):**
```json
{
  "message": "Pending comments retrieved",
  "comments": [
    { "id": 1, "title": "...", "pending_comments": [ { "id": "...", "author": "...", "message": "...", "status": "pending", "created_at": "..." } ] }
  ]
}
```
**Response - Error (404):** `{ "message": "No pending comments found" }`

---

### 16. Approve Comment (Legacy)

**Endpoint:** `POST /api/post/comments/pending`

**Purpose:** Set a legacy comment’s status to `approved`.

**Authentication Required:** ✅ Yes (Admin)

**Query Parameters:** `postId`, `commentId`

**Example:** `POST /api/post/comments/pending?postId=1&commentId=abc123`

**Response - Success (200):** `{ "message": "Comment approved" }`  
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 17. Monthly Post Stats

**Endpoint:** `GET /api/post/monthly-stats`

**Purpose:** Counts for a given month: posts, comments (from `comments` table), likes (from `post_likes`).

**Authentication Required:** ✅ Yes (Admin)

**Query Parameters:** `month` (1–12), `year` (required)

**Example:** `GET /api/post/monthly-stats?month=1&year=2025`

**Response - Success (200):**
```json
{
  "message": "Monthly stats retrieved",
  "data": {
    "total_posts": 15,
    "total_comments": 45,
    "total_likes": 250
  }
}
```
**Response - Error (400):** `{ "message": "Valid month (1-12) and year are required" }`

---

### 18. Daily Stats History

**Endpoint:** `GET /api/post/daily-stats/history`

**Purpose:** Per-day counts (posts, comments, likes) for the last N days (for charts).

**Authentication Required:** ✅ Yes (Admin)

**Query Parameters:** `days` (optional, default 10, clamped 1–31)

**Response - Success (200):**
```json
{
  "message": "Daily stats history retrieved",
  "data": [
    { "date": "2025-01-01", "posts": 2, "comments": 5, "likes": 20 },
    ...
  ]
}
```

---

### 19. Monthly Stats History

**Endpoint:** `GET /api/post/monthly-stats/history`

**Purpose:** Per-month counts for the last N months (for charts).

**Authentication Required:** ✅ Yes (Admin)

**Query Parameters:** `months` (optional, default 12, max 24)

**Response - Success (200):**
```json
{
  "message": "Monthly stats history retrieved",
  "data": [
    { "year": 2025, "month": 1, "total_posts": 15, "total_comments": 45, "total_likes": 250 },
    ...
  ]
}
```

---

## 💬 Comment APIs (Dedicated Table)

Comments are also stored in a `comments` table with threading (`parent_id`), `user_identifier`, and status (`pending` | `approved` | `rejected`). These endpoints use that table.

### 1. Add Comment

**Endpoint:** `POST /api/comments`

**Purpose:** Create a comment (or reply). Status defaults to pending.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "post_id": 1,
  "user_identifier": "device-or-session-id",
  "message": "Your comment text.",
  "parent_id": null,
  "user_name": "Display Name"
}
```
- `post_id`, `user_identifier`, `message` required.  
- `parent_id` optional (reply to comment ID).  
- `user_name` optional display name.

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Comment posted successfully.",
  "comment": { "id": 1, "post_id": 1, "user_identifier": "...", "message": "...", "status": "pending", ... }
}
```
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 2. Get Post Comments (Public)

**Endpoint:** `GET /api/comments/post/:postId`

**Purpose:** Latest approved comments for a post (threaded).

**Authentication Required:** ❌ No

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "comments": [...],
  "count": 10
}
```

---

### 3. Get All Comments for a Post (Dashboard)

**Endpoint:** `GET /api/comments/post/:postId/all`

**Purpose:** All comments for a post including pending/rejected.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "comments": [...],
  "count": 15
}
```

---

### 4. Get All Comments (Moderation)

**Endpoint:** `GET /api/comments`

**Purpose:** List comments optionally filtered by status.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Query Parameters:** `status` (optional): `pending` | `approved` | `rejected`

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "comments": [...],
  "count": 20
}
```

---

### 5. Update Comment

**Endpoint:** `PATCH /api/comments/:id`

**Purpose:** Update status, message, or user_name.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Request Body:** One or more of:
```json
{
  "status": "approved",
  "message": "Edited text",
  "user_name": "New Name"
}
```
`status` must be `pending` | `approved` | `rejected`.

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "comment": { ... }
}
```
**Response - Error (404):** `{ "message": "Comment not found" }`

---

### 6. Delete Comment

**Endpoint:** `DELETE /api/comments/:id`

**Purpose:** Remove a comment.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Response - Success (200):** `{ "success": true, "message": "Comment deleted successfully" }`  
**Response - Error (404):** `{ "message": "Comment not found" }`

---

## 👍 Like APIs (Dedicated Table)

Likes are stored in `post_likes` with `post_id` and `user_identifier`. Use these for like/unlike and count.

### 1. Like Post

**Endpoint:** `POST /api/likes`

**Purpose:** Record a like for a post by user identifier (idempotent if already liked).

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "post_id": 1,
  "user_identifier": "device-or-session-id"
}
```

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "liked": true,
  "likeCount": 11
}
```
If already liked: **200** with `"Post already liked"`, `liked: true`.

---

### 2. Unlike Post

**Endpoint:** `DELETE /api/likes`

**Purpose:** Remove like for post + user_identifier.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "post_id": 1,
  "user_identifier": "device-or-session-id"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "liked": false,
  "likeCount": 10
}
```

---

### 3. Check Like Status

**Endpoint:** `GET /api/likes/check`

**Query Parameters:** `post_id`, `user_identifier`

**Response - Success (200):**
```json
{
  "success": true,
  "liked": true
}
```

---

### 4. Get Like Count

**Endpoint:** `GET /api/likes/count/:postId`

**Purpose:** Total like count for a post.

**Response - Success (200):**
```json
{
  "success": true,
  "count": 10
}
```

---

## 🏷️ Category APIs

### 1. Create Category

**Endpoint:** `POST /api/category/add`

**Authentication Required:** ✅ Yes (Admin)

**Request Body:**
```json
{
  "name": "Technology",
  "slug": "technology"
}
```
`slug` optional (auto-generated from name).

**Response - Success (201):** `{ "message": "Category created", "category": { "id": 1, "name": "Technology", "slug": "technology", "created_at": "..." } }`  
**Response - Error (400):** `{ "message": "Category name is required" }`

---

### 2. Get All Categories

**Endpoint:** `GET /api/category`

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "message": "Categories retrieved", "categories": [ { "id": 1, "name": "Technology", "slug": "technology", "created_at": "..." } ] }`

---

### 3. Get Category by ID

**Endpoint:** `GET /api/category/:id`

**Authentication Required:** ❌ No

**Response - Success (200):** `{ "message": "Category retrieved", "category": { ... } }`  
**Response - Error (404):** `{ "message": "Category not found" }`

---

### 4. Update Category

**Endpoint:** `PUT /api/category/update/:id`

**Authentication Required:** ✅ Yes (Admin)

**Request Body:**
```json
{
  "name": "Tech & Innovation",
  "slug": "tech-innovation"
}
```

**Response - Success (200):** `{ "message": "Category updated", "category": { ... } }`  
**Response - Error (401):** Unauthorized

---

### 5. Delete Category

**Endpoint:** `DELETE /api/category/:id`

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):** `{ "message": "Category deleted" }`  
**Response - Error (401):** Unauthorized

---

## 📧 Newsletter APIs

### 1. Subscribe

**Endpoint:** `POST /api/newsletter-subscribe`

**Authentication Required:** ❌ No

**Request Body:** `{ "email": "subscriber@example.com" }`

**Response - Success (201):**
```json
{
  "message": "Thank you for subscribing! You will receive a confirmation email.",
  "data": { "id": 1, "email": "subscriber@example.com", "created_at": "..." }
}
```
**Response - Error (400):** `{ "message": "Email is required" }`  
**Response - Error (409):** `{ "message": "This Email is already subscribed!" }`

A welcome email is sent via Nodemailer.

---

### 2. Unsubscribe

**Endpoint:** `DELETE /api/newsletter-unsubscribe`

**Authentication Required:** ❌ No

**Request Body:** `{ "email": "subscriber@example.com" }`

**Response - Success (200):** `{ "message": "Unsubscribed successfully" }`  
**Response - Error (400):** `{ "message": "Email is required" }`  
**Response - Error (404):** `{ "message": "Email not found" }`

---

### 3. Get All Subscribers

**Endpoint:** `GET /api/newsletter-subscribe`

**Purpose:** Paginated list of subscribers (admin).

**Authentication Required:** ❌ No (consider protecting in production)

**Query Parameters:** `page` (default 1), `limit` (default 10)

**Response - Success (200):**
```json
{
  "total": 100,
  "currentPage": 1,
  "totalPages": 10,
  "data": [ { "id": 1, "email": "...", "created_at": "..." } ]
}
```

---

## 📊 Activity APIs

User activity (e.g. like, comment, view) per post and user_identifier.

### 1. Log Activity

**Endpoint:** `POST /api/activity`

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "post_id": 1,
  "user_identifier": "device-or-session-id",
  "action_type": "view",
  "device_info": "optional string"
}
```
`action_type` must be `like` | `comment` | `view`.

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "activity": { ... }
}
```
**Response - Error (404):** `{ "message": "Post not found" }`

---

### 2. Get Post Activity

**Endpoint:** `GET /api/activity/post/:postId`

**Purpose:** List activity records for a post.

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Activity retrieved successfully",
  "activities": [...],
  "count": 25
}
```

---

### 3. Get Activity Stats for Post

**Endpoint:** `GET /api/activity/stats/:postId`

**Purpose:** Aggregated counts by action_type (likes, comments, views).

**Authentication Required:** ✅ Yes (Admin or Moderator)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Activity statistics retrieved successfully",
  "stats": {
    "likes": 10,
    "comments": 5,
    "views": 100
  }
}
```

---

## 📄 Site Content APIs

Manage page/section content (e.g. hero, footer) with optional images. Allowed sections per page are defined in the backend (e.g. `home`: latest, hero, footer, newsletter; `about`: hero, author, mission, etc.).

### 1. Get All Contents

**Endpoint:** `GET /api/site-content`

**Purpose:** All site contents (dashboard).

**Authentication Required:** ❌ No

**Response - Success (200):**
```json
{
  "success": true,
  "contents": [ { "id": 1, "page_key": "home", "section_key": "hero", "content": { ... }, "image_url": "...", ... } ]
}
```

---

### 2. Get Content by Page Key

**Endpoint:** `GET /api/site-content/page/:page_key`

**Purpose:** Contents for a single page (public).

**Authentication Required:** ❌ No

**Example:** `GET /api/site-content/page/home`

**Response - Success (200):**
```json
{
  "success": true,
  "page_key": "home",
  "contents": [ { "section_key": "hero", "content": { ... }, "image_url": "..." } ]
}
```

---

### 3. Create Content

**Endpoint:** `POST /api/site-content`

**Authentication Required:** ✅ Yes (Admin)

**Headers:** `Content-Type: multipart/form-data` (if image used)

**Request Body (JSON or form):**
- `page_key`, `section_key` (required)
- `content` (JSON object)
- `image` (file, optional)

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Site content created",
  "content": { "id": 1, "page_key": "home", "section_key": "hero", ... }
}
```
**Response - Error (409):** `{ "message": "That page/section already exists" }`

---

### 4. Update Content

**Endpoint:** `PUT /api/site-content/:id`

**Authentication Required:** ✅ Yes (Admin)

**Request Body:** `content` (JSON object), optional `remove_image` (true to remove image). New image via `upload.single("image")`.

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Site content updated",
  "content": { ... }
}
```
**Response - Error (404):** `{ "message": "Site content not found" }`

---

### 5. Delete Content

**Endpoint:** `DELETE /api/site-content/:id`

**Authentication Required:** ✅ Yes (Admin)

**Response - Success (200):** `{ "success": true, "message": "Site content deleted" }`  
**Response - Error (404):** `{ "message": "Site content not found" }`

---

## 🔒 Authentication Methods

- **Cookie:** Login sets HTTP-only cookie `token`. Middleware reads `req.headers.cookie` (e.g. `token=...`).
- **Header:** `Authorization: Bearer <token>`
- Middleware checks cookie first, then Authorization header.

---

## 📊 Response Status Codes

| Code | Meaning | Usage |
|------|---------|--------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation, missing/invalid fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but role not allowed |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate (e.g. email already subscribed) |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | DB connection issues |
| 504 | Gateway Timeout | Query timeout |

---

## 🛠️ Error Response Format

From centralized `errorHandler`:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "stack": "..." 
}
```
`stack` only in development. Some routes still return `{ "message": "..." }` without `success`.

---

## 📝 Notes

1. **Two comment systems:** Legacy comments stored in post `comments` JSONB (`POST /api/post/comment/:id`, pending/approve under `/api/post/comments/pending`). New comments in `comments` table with threading (`/api/comments`).
2. **Two like flows:** Legacy slug-based like/unlike on post (`/api/post/:slug/like`, `/api/post/:slug/unlike`). New like system by `post_id` + `user_identifier` (`/api/likes`).
3. **Caching:** Redis used for post lists, single post, trending, pinned, comments, site content. Graceful if Redis is down (cache miss).
4. **Image uploads:** Post featured images and site content images go to Cloudinary; public_id stored for deletion.
5. **Slug generation:** If slug not provided, generated from title (lowercase, spaces to hyphens, strip non-word chars).
6. **Passwords:** BCrypt, 10 salt rounds.
7. **JWT:** Expiration configured in `utils/jwt.js`.
8. **Pagination:** Many list endpoints use `page` (and sometimes `limit`).
9. **Roles:** `admin`, `moderator`, `writer`; auth routes use `verifyAdmin`; others use `verifyAuth, allowRoles("admin")` or `allowRoles("admin", "moderator")`.

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set environment variables (e.g. `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, Cloudinary, Nodemailer).
3. Run migrations: `npm run migrate`
4. Seed admin (optional): `npm run seed:admin`
5. Start server: `npm start` or `npm run dev`

See the main [README.md](../README.md) for full setup.

---

## 📚 Additional Resources

- **Main Project README:** [../README.md](../README.md)
- **Postman API Collection:** [Link to Postman documentation](https://documenter.getpostman.com/view/38227871/2sB3dMyWmj)

---

## 👨‍💻 Author

**Masaud Ahmod**  
MERN Stack Developer

---

**Happy Coding! 🎉**
