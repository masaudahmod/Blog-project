import { createUserTable, alterUserTable } from "../models/user.model.js";
import { createCategoryTable } from "../models/category.model.js";
import { createPostTable, createPostIndexes, alterPostTableAddAuthorId, alterPostTableAddIsPinned } from "../models/post.model.js";
import { createNewsletterTable } from "../models/newsletter.model.js";
import { createCommentTable } from "../models/comment.model.js";
import { createPostLikeTable } from "../models/postLike.model.js";
import { createUserActivityTable } from "../models/userActivity.model.js";
import { createSiteContentTable } from "../models/siteContent.model.js"; // Import site content table helper

/**
 * Migration script to update database schema
 * Run this once to add new tables and columns
 */
const migrate = async () => {
  try {
    console.log("Starting database migration...");

    // Base tables (order matters for foreign keys)
    await createUserTable();
    console.log("✓ Created users table");

    await alterUserTable();
    console.log("✓ Ensured users.status column exists");

    await createCategoryTable();
    console.log("✓ Created categories table");

    await createPostTable();
    console.log("✓ Created posts table");

    await createNewsletterTable();
    console.log("✓ Created newsletters table");

    // Post table migrations
    await alterPostTableAddAuthorId();
    console.log("✓ Added author_id column to posts table");

    // Add is_pinned to posts table
    await alterPostTableAddIsPinned();
    console.log("✓ Added is_pinned column to posts table");

    // Dependent tables
    await createCommentTable();
    console.log("✓ Created comments table");

    await createPostLikeTable();
    console.log("✓ Created post_likes table");

    await createUserActivityTable();
    console.log("✓ Created user_activity table");

    await createSiteContentTable(); // Create site_contents table
    console.log("✓ Created site_contents table"); // Log table creation

    // Optional indexes
    await createPostIndexes();
    console.log("✓ Ensured post indexes exist");

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
};

migrate();
