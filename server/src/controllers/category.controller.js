import pool from "../config/db.js";
import { createCategory, getCategories } from "../models/Category.model.js";

export const addCategory = async (req, res) => {
  const { name, slug } = req.body;

  const result = await createCategory(name, slug);
  res
    .status(201)
    .json({ message: "Category created", category: result.rows[0] });
};

export const allCategories = async (req, res) => {
  // const result = await getCategories();
  const query = "SELECT * FROM categories ORDER BY id DESC";
  const result = await pool.query(query);
  res
    .status(200)
    .json({ message: "Categories retrieved", categories: result.rows });
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
  const { id } = req.params;
  await deleteCategory(id);

  // const query = "DELETE FROM categories WHERE id = $1";
  // const values = [id];
  // await pool.query(query, values);

  res.status(200).json({ message: "Category deleted" });
};
