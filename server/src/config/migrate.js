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
 * Migration script: creates/updates all tables in dependency order.
 * Tables: users, categories, posts, newsletters, comments, post_likes, user_activity, site_contents
 * Run: npm run migrate
 */
const migrate = async () => {
  try {
    console.log("Starting database migration...\n");

    // 1. Users (no FK)
    await createUserTable();
    console.log("✓ users");
    await alterUserTable();
    console.log("✓ users.status");

    // 2. Categories (FK: created_by -> users)
    await createCategoryTable();
    console.log("✓ categories");

    // 3. Posts (FK: category_id, author_id -> users)
    await createPostTable();
    console.log("✓ posts");
    await alterPostTableAddAuthorId();
    console.log("✓ posts.author_id");
    await alterPostTableAddIsPinned();
    console.log("✓ posts.is_pinned");
    await createPostIndexes();
    console.log("✓ posts indexes");

    // 4. Newsletters (no FK)
    await createNewsletterTable();
    console.log("✓ newsletters");

    // 5. Comments (FK: post_id -> posts, parent_id -> comments)
    await createCommentTable();
    console.log("✓ comments");
    await alterCommentTableAddThreadAndName();
    console.log("✓ comments.parent_id, user_name");
    await alterCommentTableDefaultApproved();
    console.log("✓ comments default status");

    // 6. Post likes (FK: post_id -> posts)
    await createPostLikeTable();
    console.log("✓ post_likes");

    // 7. User activity (FK: post_id -> posts)
    await createUserActivityTable();
    console.log("✓ user_activity");

    // 8. Site content (no FK)
    await createSiteContentTable();
    console.log("✓ site_contents");

    console.log("\nDatabase migration completed successfully.");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
};

migrate();
