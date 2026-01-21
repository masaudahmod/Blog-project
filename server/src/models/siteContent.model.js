import pool from "../config/db.js"; // Import database pool
export const createSiteContentTable = async () => { // Define table creation helper
  await pool.query( // Execute table creation query
    `CREATE TABLE IF NOT EXISTS site_contents ( -- Create site_contents table
      id SERIAL PRIMARY KEY, -- Add primary key
      page_key VARCHAR(100) NOT NULL, -- Store page identifier
      section_key VARCHAR(100) NOT NULL, -- Store section identifier
      content JSONB NOT NULL, -- Store section content as JSON
      created_at TIMESTAMP DEFAULT NOW(), -- Set creation timestamp
      updated_at TIMESTAMP DEFAULT NOW(), -- Set update timestamp
      UNIQUE (page_key, section_key) -- Enforce unique page/section pairs
    );` // End table definition
  ); // End query execution
}; // End createSiteContentTable
export const getAllSiteContents = async () => { // Define read-all helper
  return pool.query( // Execute select query
    "SELECT * FROM site_contents ORDER BY page_key ASC, section_key ASC" // Order by page and section
  ); // End query execution
}; // End getAllSiteContents
export const getSiteContentsByPageKey = async (pageKey) => { // Define read-by-page helper
  return pool.query( // Execute select query
    "SELECT * FROM site_contents WHERE page_key = $1 ORDER BY section_key ASC", // Filter by page_key
    [pageKey] // Provide page key parameter
  ); // End query execution
}; // End getSiteContentsByPageKey
export const createSiteContent = async ({ page_key, section_key, content }) => { // Define insert helper
  return pool.query( // Execute insert query
    `INSERT INTO site_contents (page_key, section_key, content) VALUES ($1, $2, $3) RETURNING *`, // Insert and return row
    [page_key, section_key, JSON.stringify(content)] // Bind values with JSON content
  ); // End query execution
}; // End createSiteContent
export const updateSiteContentById = async (id, content) => { // Define update helper
  return pool.query( // Execute update query
    `UPDATE site_contents SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, // Update content
    [JSON.stringify(content), id] // Bind updated content and id
  ); // End query execution
}; // End updateSiteContentById
export const deleteSiteContentById = async (id) => { // Define delete helper
  return pool.query( // Execute delete query
    "DELETE FROM site_contents WHERE id = $1 RETURNING *", // Delete by id
    [id] // Bind id
  ); // End query execution
}; // End deleteSiteContentById
