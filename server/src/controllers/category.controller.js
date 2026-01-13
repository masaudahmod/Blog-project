import pool from "../config/db.js";
import { createCategory, deleteCategoryById, getCategories, deactivateCategory } from "../models/Category.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";

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
    // Get query parameter to show all categories (including inactive) for admin
    const showAll = req.query.showAll === "true";
    
    const query = showAll
      ? `SELECT id, name, slug, created_at, active FROM categories ORDER BY id DESC`
      : `SELECT id, name, slug, created_at, active FROM categories WHERE active = TRUE ORDER BY id DESC`;
    
    const result = await pool.query(query);

    return res.status(200).json({
      message: "Categories retrieved",
      categories: result.rows,
    });
  } catch (error) {
    // Handle specific database connection errors
    if (error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("Database connection timeout/refused:", {
        code: error.code,
        message: error.message,
        address: error.address,
        port: error.port,
      });
      return res.status(503).json({ 
        message: "Database connection unavailable. Please try again later.",
        error: "Service temporarily unavailable"
      });
    }
    
    // Handle query timeout errors
    if (error.code === "57014" || error.message?.includes("timeout")) {
      console.error("Database query timeout:", error.message);
      return res.status(504).json({ 
        message: "Database query timed out. Please try again.",
        error: "Gateway timeout"
      });
    }
    
    // Generic database errors
    console.error("Get Categories Error:", {
      code: error.code,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    
    return res.status(500).json({ 
      message: "Server error while fetching categories",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
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

/**
 * Soft delete: Set category as inactive instead of hard deleting
 * DELETE /api/category/:id
 * Requires: admin role
 * 
 * This sets the category's active status to false, preserving data integrity
 * and allowing for potential reactivation in the future.
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    throw new AppError("Valid category ID is required", 400);
  }

  const categoryId = parseInt(id);

  // Check if category exists
  const categoryCheck = await pool.query(
    "SELECT id, name, active FROM categories WHERE id = $1",
    [categoryId]
  );

  if (categoryCheck.rows.length === 0) {
    throw new AppError("Category not found", 404);
  }

  const category = categoryCheck.rows[0];

  // Check if already inactive
  if (!category.active) {
    throw new AppError("Category is already inactive", 400);
  }

  // Set category as inactive (soft delete)
  const result = await deactivateCategory(categoryId);

  if (result.rowCount === 0) {
    throw new AppError("Failed to deactivate category", 500);
  }

  res.status(200).json({
    success: true,
    message: "Category deactivated successfully",
    category: result.rows[0],
  });
});
