import pool from "../config/db.js";

// email save করা
export const createSubscription = async (email) => {
  const query =
    "INSERT INTO newsletters (email) VALUES ($1) RETURNING *";

  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// email already আছে কিনা check
export const findByEmail = async (email) => {
  const query = "SELECT * FROM newsletters WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
