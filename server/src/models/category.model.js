import pool from "../config/db.js";

export const createCategoryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id),
      active BOOLEAN DEFAULT TRUE
    );
  `);
};

export const createCategory = (name, slug, createdBy) => {
  return pool.query(
    "INSERT INTO categories (name, slug, created_by) VALUES ($1, $2, $3) RETURNING *",
    [name, slug, createdBy]
  );
};

export const getCategories = () => {
  return pool.query("SELECT * FROM categories ORDER BY id DESC");
};

export const deleteCategoryById = (id) => {
  return pool.query("DELETE FROM categories WHERE id = $1", [id]);
};

/**
 * Soft delete: Set category as inactive instead of deleting
 * @param {number} id - Category ID
 * @returns {Promise} Query result
 */
export const deactivateCategory = (id) => {
  return pool.query(
    "UPDATE categories SET active = FALSE WHERE id = $1 RETURNING *",
    [id]
  );
};