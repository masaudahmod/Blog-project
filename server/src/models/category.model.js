import pool from "../config/db.js";

export const createCategoryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const createCategory = (name, slug) => {
  return pool.query(
    "INSERT INTO categories (name, slug) VALUES ($1,$2) RETURNING *",
    [name, slug]
  );
};

export const getCategories = () => {
  return pool.query("SELECT * FROM categories ORDER BY id DESC");
};
