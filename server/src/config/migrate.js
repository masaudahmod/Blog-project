import pool from "./db.js";
import { createUserTable, alterUserTable } from "../models/user.model.js";
import { createCategoryTable } from "../models/category.model.js";
import {
  createPostTable,
  createPostIndexes,
  alterPostTableAddAuthorId,
  alterPostTableAddIsPinned,
} from "../models/post.model.js";
import { createNewsletterTable } from "../models/newsletter.model.js";
import {
  createCommentTable,
  alterCommentTableAddThreadAndName,
  alterCommentTableDefaultApproved,
} from "../models/comment.model.js";
import { createPostLikeTable } from "../models/postLike.model.js";
import { createUserActivityTable } from "../models/userActivity.model.js";
import { createSiteContentTable } from "../models/siteContent.model.js";

/**
 * Expected tables (one per model). Used for post-migration check.
 */
const EXPECTED_TABLES = [
  "users",
  "categories",
  "posts",
  "newsletters",
  "comments",
  "post_likes",
  "user_activity",
  "site_contents",
];

/**
 * Verify that all expected tables exist after migration.
 */
const checkTablesExist = async () => {
  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
     AND table_name = ANY($1::text[])`,
    [EXPECTED_TABLES]
  );
  const existing = new Set(rows.map((r) => r.table_name));
  const missing = EXPECTED_TABLES.filter((t) => !existing.has(t));
  if (missing.length) {
    console.warn("\n⚠ Missing tables:", missing.join(", "));
    return false;
  }
  console.log("\n✓ Check: all expected tables exist.");
  return true;
};

/**
 * Migration script: creates/updates all tables in dependency order.
 *
 * Model → steps:
 *   user.model.js       → users, users.status
 *   category.model.js   → categories
 *   post.model.js       → posts, posts.author_id, posts.is_pinned, post indexes
 *   newsletter.model.js → newsletters
 *   comment.model.js    → comments, comments.parent_id/user_name, comments default status
 *   postLike.model.js   → post_likes
 *   userActivity.model.js → user_activity
 *   siteContent.model.js → site_contents
 *
 * Run: npm run migrate
 */
const migrate = async () => {
  try {
    console.log("Starting database migration...\n");

    // 1. users (user.model.js) — no FK
    await createUserTable();
    console.log("✓ users");
    await alterUserTable();
    console.log("✓ users.status");

    // 2. categories (category.model.js) — FK: created_by → users
    await createCategoryTable();
    console.log("✓ categories");

    // 3. posts (post.model.js) — FK: category_id, author_id → users
    await createPostTable();
    console.log("✓ posts");
    await alterPostTableAddAuthorId();
    console.log("✓ posts.author_id");
    await alterPostTableAddIsPinned();
    console.log("✓ posts.is_pinned");
    await createPostIndexes();
    console.log("✓ posts indexes");

    // 4. newsletters (newsletter.model.js) — no FK
    await createNewsletterTable();
    console.log("✓ newsletters");

    // 5. comments (comment.model.js) — FK: post_id → posts, parent_id → comments
    await createCommentTable();
    console.log("✓ comments");
    await alterCommentTableAddThreadAndName();
    console.log("✓ comments.parent_id, user_name");
    await alterCommentTableDefaultApproved();
    console.log("✓ comments default status");

    // 6. post_likes (postLike.model.js) — FK: post_id → posts
    await createPostLikeTable();
    console.log("✓ post_likes");

    // 7. user_activity (userActivity.model.js) — FK: post_id → posts
    await createUserActivityTable();
    console.log("✓ user_activity");

    // 8. site_contents (siteContent.model.js) — no FK
    await createSiteContentTable();
    console.log("✓ site_contents");

    const allOk = await checkTablesExist();
    console.log("\nDatabase migration completed successfully.");
    if (!allOk) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
};

migrate();
