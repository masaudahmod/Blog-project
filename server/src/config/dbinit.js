import pool from "./db.js";
import { createCategoryTable } from "../models/Category.model.js";
import { createPostTable } from "../models/post.model.js";
import { createUserTable } from "../models/user.model.js";

const initDB = async () => {
  try {
    await createUserTable();
    console.log("User table created");
    await createCategoryTable();
    console.log("Category table created");
    await createPostTable();
    console.log("Post table created");
  } catch (error) {
    console.error("DB Initialization Error:", error.message);
  } finally {
    console.log("Database Initialized Successfully");
    await pool.end();
    process.exit(1);
  }
};

initDB();
