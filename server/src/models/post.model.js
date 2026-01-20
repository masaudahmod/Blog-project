import pool from "../config/db.js";

export const createPostTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,

      title VARCHAR(200) NOT NULL,
      slug VARCHAR(250) UNIQUE NOT NULL,

      content TEXT,
      excerpt VARCHAR(300),

      featured_image_url TEXT,
      featured_image_public_id VARCHAR(255),
      featured_image_alt VARCHAR(255),
      featured_image_caption VARCHAR(255),

      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT[],

      canonical_url TEXT,
      schema_type VARCHAR(100) DEFAULT 'Article',

      category_id INTEGER REFERENCES categories(id),
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

      tags TEXT[],

      read_time INTEGER DEFAULT 1,

      -- 👉 সব ইন্টারঅ্যাকশন এক পোস্টে
      likes INTEGER DEFAULT 0,
      comments JSONB DEFAULT '[]',       -- comment array (legacy, kept for backward compatibility)
      interactions JSONB DEFAULT '[]',   -- view, share, reaction ট্র্যাকিং

      is_published BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMP,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

/**
 * Add author_id column to existing posts table (migration)
 */
export const alterPostTableAddAuthorId = async () => {
  await pool.query(`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
  `);
};

/**
 * Add is_pinned column to existing posts table (migration)
 */
export const alterPostTableAddIsPinned = async () => {
  await pool.query(`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
  `);
  
  // Create index for faster queries on pinned posts
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_is_pinned 
    ON posts(is_pinned) WHERE is_pinned = TRUE;
  `);
};

export const createPost = (data) => {
  return pool.query(
    `INSERT INTO posts 
     (title, slug, content, excerpt, 
      featured_image_url, featured_image_alt, featured_image_caption,
      meta_title, meta_description, meta_keywords,
      canonical_url, schema_type,
      category_id, author_id, tags, read_time,
      likes, comments, interactions,
      is_published, published_at)
     VALUES 
     ($1,$2,$3,$4,
      $5,$6,$7,
      $8,$9,$10,
      $11,$12,
      $13,$14,$15,$16,
      $17,$18,$19,
      $20,$21)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.content,
      data.excerpt,

      data.featured_image_url,
      data.featured_image_alt,
      data.featured_image_caption,

      data.meta_title,
      data.meta_description,
      data.meta_keywords,

      data.canonical_url,
      data.schema_type,

      data.category_id,
      data.author_id || null,
      data.tags,
      data.read_time,

      data.likes || 0,
      JSON.stringify(data.comments || []),
      JSON.stringify(data.interactions || []),

      data.is_published,
      data.published_at,
    ]
  );
};

export const getPosts = () => {
  return pool.query(`SELECT * FROM posts ORDER BY id DESC`);
};

export const updatePost = (id, data) => {
  return pool.query(
    `UPDATE posts SET 
      title = $1, slug = $2, content = $3, excerpt = $4,
      featured_image_url = $5, featured_image_alt = $6, featured_image_caption = $7,
      meta_title = $8, meta_description = $9, meta_keywords = $10,
      canonical_url = $11, schema_type = $12,
      category_id = $13, author_id = $14, tags = $15, read_time = $16,
      likes = $17, comments = $18, interactions = $19,
      is_published = $20, published_at = $21,
      updated_at = NOW()
     WHERE id = $22
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.content,
      data.excerpt,

      data.featured_image_url,
      data.featured_image_alt,
      data.featured_image_caption,

      data.meta_title,
      data.meta_description,
      data.meta_keywords,

      data.canonical_url,
      data.schema_type,

      data.category_id,
      data.author_id || null,
      data.tags,
      data.read_time,

      data.likes || 0,
      JSON.stringify(data.comments || []),
      JSON.stringify(data.interactions || []),

      data.is_published,
      data.published_at,
      id,
    ]
  );
};

/**
 * Create indexes for optimal query performance
 * Run this after table creation for better performance
 */
export const createPostIndexes = async () => {
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_category_id 
    ON posts(category_id);
  `);
  
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_is_published 
    ON posts(is_published);
  `);
  
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_category_published 
    ON posts(category_id, is_published);
  `);
  
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_created_at 
    ON posts(created_at DESC);
  `);
  
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_is_pinned 
    ON posts(is_pinned) WHERE is_pinned = TRUE;
  `);
};

/**
 * Pin a post by ID (unpins all other posts first)
 * Uses transaction to ensure atomicity - only one post can be pinned at a time
 * @param {number} postId - The ID of the post to pin
 * @returns {Promise} Query result with the pinned post
 */
export const pinPostById = async (postId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First, unpin all posts
    await client.query('UPDATE posts SET is_pinned = FALSE WHERE is_pinned = TRUE');
    
    // Then pin the specified post
    const result = await client.query(
      'UPDATE posts SET is_pinned = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [postId]
    );
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get the currently pinned post
 * @returns {Promise} Query result with the pinned post (or empty if none)
 */
export const getPinnedPost = () => {
  return pool.query(
    `SELECT * FROM posts WHERE is_pinned = TRUE ORDER BY updated_at DESC LIMIT 1`
  );
};

/**
 * Unpin all posts
 * Uses transaction to ensure atomicity
 * @returns {Promise} Query result
 */
export const unpinAllPosts = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE posts SET is_pinned = FALSE, updated_at = NOW() WHERE is_pinned = TRUE RETURNING *'
    );
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
