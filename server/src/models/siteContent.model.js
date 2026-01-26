import pool from "../config/db.js";
export const createSiteContentTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS site_contents (
      id SERIAL PRIMARY KEY,
      page_key VARCHAR(100) NOT NULL,
      section_key VARCHAR(100) NOT NULL,
      content JSONB NOT NULL,
      image_url TEXT,
      image_public_id VARCHAR(255),
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
export const createSiteContent = async ({ page_key, section_key, content, image_url = null, image_public_id = null }) => {
  return pool.query(
    `INSERT INTO site_contents (page_key, section_key, content, image_url, image_public_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [page_key, section_key, JSON.stringify(content), image_url, image_public_id]
  );
};
export const updateSiteContentById = async (id, content, image_url = undefined, image_public_id = undefined) => {
  // Build dynamic update query based on whether image is provided
  // Use undefined to mean "don't update image", null to mean "remove image", string to mean "set new image"
  if (image_url !== undefined && image_public_id !== undefined) {
    // Update both content and image (can be null to remove image)
    return pool.query(
      `UPDATE site_contents SET content = $1, image_url = $2, image_public_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [JSON.stringify(content), image_url, image_public_id, id]
    );
  } else {
    // Update only content (image fields remain unchanged)
    return pool.query(
      `UPDATE site_contents SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(content), id]
    );
  }
};
export const deleteSiteContentById = async (id) => {
  return pool.query(
    "DELETE FROM site_contents WHERE id = $1 RETURNING *",
    [id]
  );
};
