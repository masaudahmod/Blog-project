import pool from "../config/db.js";
import { createCategory, getCategories } from "../models/Category.model.js";

export const addCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" }); // return res.status(400).json({ message: "All fields are required" });
    }
    let category_slug = slug;
    if (!slug) {
      category_slug = name.replace(/[^a-z0-9_]+/gi, "-").toLowerCase();
    }
    const result = await createCategory(name, category_slug);
    res
      .status(201)
      .json({ message: "Category created", category: result.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error in add category", error: error.message });
  }
};

export const allCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, slug, created_at
        FROM categories
        ORDER BY id DESC;
      `
    );

    return res.status(200).json({
      message: "Categories retrieved",
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCategory = async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM categories WHERE id = $1";
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0)
    return res.status(404).json({ message: "Category not found" });
  res
    .status(200)
    .json({ message: "Category retrieved", category: result.rows[0] });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  const query = `
    UPDATE categories 
    SET name = $1, slug = $2
    WHERE id = $3
    RETURNING *;
  `;

  const values = [name, slug, id];
  const result = await pool.query(query, values);
  // const result = await updateCategory(id, name, slug);
  res
    .status(200)
    .json({ message: "Category updated", category: result.rows[0] });
};
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM categories WHERE id = $1";
    const values = [id];
    await pool.query(query, values);

    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Server Error in delete category",
      error: error.message,
    });
  }
};
