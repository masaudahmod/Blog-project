import { alterPostTableAddAuthorId, alterPostTableAddIsPinned } from "../models/post.model.js";
import { createCommentTable } from "../models/comment.model.js";
import { createPostLikeTable } from "../models/postLike.model.js";
import { createUserActivityTable } from "../models/userActivity.model.js";

/**
 * Migration script to update database schema
 * Run this once to add new tables and columns
 */
const migrate = async () => {
  try {
    console.log("Starting database migration...");

    // Add author_id to posts table
    await alterPostTableAddAuthorId();
    console.log("✓ Added author_id column to posts table");

    // Add is_pinned to posts table
    await alterPostTableAddIsPinned();
    console.log("✓ Added is_pinned column to posts table");

    // Create new tables
    await createCommentTable();
    console.log("✓ Created comments table");

    await createPostLikeTable();
    console.log("✓ Created post_likes table");

    await createUserActivityTable();
    console.log("✓ Created user_activity table");

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
};

migrate();
