import pool from "./db.js";
import { createCategoryTable } from "../models/Category.model.js";
import { createPostTable } from "../models/post.model.js";
import { createUserTable } from "../models/user.model.js";
import { createNewsletterTable } from "../models/newsletter.model.js";

const initDB = async () => {
  try {
    await createUserTable();
    console.log("User table created");
    await createCategoryTable();
    console.log("Category table created");
    await createPostTable();
    console.log("Post table created");
    await createNewsletterTable();
    console.log("Newsletter table created");
  } catch (error) {
    console.error("DB Initialization Error:", error.message);
  } finally {
    console.log("Database Initialized Successfully");
    process.exit(1);
  }
};

initDB();
