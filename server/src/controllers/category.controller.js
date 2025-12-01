import { createCategory, getCategories } from "../models/Category.model.js";

export const addCategory = async (req, res) => {
  const { name, slug } = req.body;

  const result = await createCategory(name, slug);
  res.json(result.rows[0]);
};

export const allCategories = async (req, res) => {
  const result = await getCategories();
  res.json(result.rows);
};
