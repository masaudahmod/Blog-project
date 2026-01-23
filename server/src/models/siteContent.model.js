import pool from "../config/db.js";
export const createSiteContentTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS site_contents (
      id SERIAL PRIMARY KEY,
      page_key VARCHAR(100) NOT NULL,
      section_key VARCHAR(100) NOT NULL,
      content JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (page_key, section_key)
    );`
  );
};
export const getAllSiteContents = async () => {
  return pool.query(
    "SELECT * FROM site_contents ORDER BY page_key ASC, section_key ASC"
  );
};
export const getSiteContentsByPageKey = async (pageKey) => {
  return pool.query(
    "SELECT * FROM site_contents WHERE page_key = $1 ORDER BY section_key ASC",
    [pageKey]
  );
};
export const createSiteContent = async ({ page_key, section_key, content }) => {
  return pool.query(
    `INSERT INTO site_contents (page_key, section_key, content) VALUES ($1, $2, $3) RETURNING *`,
    [page_key, section_key, JSON.stringify(content)]
  );
};
export const updateSiteContentById = async (id, content) => {
  return pool.query(
    `UPDATE site_contents SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [JSON.stringify(content), id]
  );
};
export const deleteSiteContentById = async (id) => {
  return pool.query(
    "DELETE FROM site_contents WHERE id = $1 RETURNING *",
    [id]
  );
};
