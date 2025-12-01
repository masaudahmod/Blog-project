import pool from "../config/db.js";

export const createPostTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(250) UNIQUE NOT NULL,
      content TEXT,
      meta_title TEXT,
      meta_description TEXT,
      category_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

export const createPost = (data) => {
  return pool.query(
    `INSERT INTO posts (title, slug, content, meta_title, meta_description, category_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      data.title,
      data.slug,
      data.content,
      data.meta_title,
      data.meta_description,
      data.category_id,
    ]
  );
};

export const getPosts = () => {
  return pool.query(`SELECT * FROM posts ORDER BY id DESC`);
};
