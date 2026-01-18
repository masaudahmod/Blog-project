## Public API Documentation (Client)

This document lists the public (no-auth) API endpoints the client can call.
Base path is defined in `server/src/app.js` and the client uses
`NEXT_SERVER_API_URL` or `NEXT_PUBLIC_API_URL` in `client/lib/action.ts`.

Base URL:
- `${NEXT_SERVER_API_URL}` or `${NEXT_PUBLIC_API_URL}` (should include `/api`)

### Posts
- `GET /post?page=1&filter=all`
  - Query: `page` (number, default 1), `filter` (all|published|draft)
  - Returns: `{ success, message, currentPage, totalPages, posts }`
- `GET /post/slug/:slug`
  - Returns: `{ message, post }`
- `GET /post/id/:id`
  - Returns: `{ message, post }`
- `GET /post/filter?categoryId=1&page=1&limit=10&filter=published&includeStats=false`
  - Query: `categoryId` or `categorySlug` required
  - Returns: `{ success, message, category, pagination, posts, categoryStats? }`
- `POST /post/comment/:id`
  - Body: `{ post_id, user_identifier, message }`
  - Returns: `{ success, message, comment }`
  - Note: This overlaps with `POST /comments` (preferred by client).
- `POST /post/:slug/like`
  - Returns: `{ success, message, liked, likeCount? }`
- `POST /post/:slug/unlike`
  - Returns: `{ success, message, liked, likeCount? }`

### Categories
- `GET /category`
  - Query: `showAll=true` (admin use; public should omit)
  - Returns: `{ message, categories }`
- `GET /category/:id`
  - Returns: `{ message, category }`

### Comments
- `POST /comments`
  - Body: `{ post_id, user_identifier, message }`
  - Returns: `{ success, message, comment }`
- `GET /comments/post/:postId`
  - Returns: `{ success, message, comments, count }`

### Likes
- `POST /likes`
  - Body: `{ post_id, user_identifier }`
  - Returns: `{ success, message, liked, likeCount? }`
- `DELETE /likes`
  - Body: `{ post_id, user_identifier }`
  - Returns: `{ success, message, liked, likeCount? }`
- `GET /likes/check?post_id=1&user_identifier=abc`
  - Returns: `{ success, liked }`
- `GET /likes/count/:postId`
  - Returns: `{ success, count }`

### Activity
- `POST /activity`
  - Body: `{ post_id, user_identifier, action_type, device_info? }`
  - `action_type`: `like` | `comment` | `view`
  - Returns: `{ success, message, activity }`

### Newsletter
- `POST /newsletter-subscribe`
  - Body: `{ email }`
  - Returns: `{ message, data }`
- `DELETE /newsletter-unsubscribe`
  - Body: `{ email }`
  - Returns: `{ message }`

### Client Usage Mapping
The client currently calls these endpoints in `client/lib/action.ts`:
- `getAllPosts` → `GET /post`
- `getPostBySlug` → `GET /post/slug/:slug`
- `getPostComments` → `GET /comments/post/:postId`
- `addComment` → `POST /comments`
- `likePost` → `POST /likes`
- `unlikePost` → `DELETE /likes`
- `checkLikeStatus` → `GET /likes/check`
- `getLikeCount` → `GET /likes/count/:postId`
- `logActivity` → `POST /activity`
- `newsletterSubscribe` → `POST /newsletter-subscribe`
