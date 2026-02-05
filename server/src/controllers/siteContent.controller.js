import { getCache, setCache, deleteCache } from "../config/redis.js"; // Import Redis cache helpers
import { createSiteContent, deleteSiteContentById, getAllSiteContents, getSiteContentsByPageKey, updateSiteContentById } from "../models/siteContent.model.js"; // Import model helpers
import { cloudinaryUpload, cloudinaryDelete } from "../service/cloudinary.js"; // Import Cloudinary service for image uploads
import pool from "../config/db.js"; // Import database pool for queries
const CACHE_TTL_SECONDS = 600; // 10 minutes
const SITE_ALL_KEY = "site:all";
const buildPageCacheKey = (pageKey) => `site:page:${pageKey}`;

/** Allowed section_key values per page_key (must match dashboard SECTION_OPTIONS_BY_PAGE) */
const ALLOWED_SECTIONS_BY_PAGE = {
  home: ["latest", "daily-middle-ad", "ad", "ad-2", "ad-3", "trending", "hero", "footer", "newsletter", "side-article"],
  blog: ["header", "latest", "newsletter", "search"],
  about: ["hero", "author", "explore", "mission", "vision", "cta"],
};

function isAllowedSection(pageKey, sectionKey) {
  const allowed = ALLOWED_SECTIONS_BY_PAGE[pageKey];
  if (!allowed) return false;
  return allowed.includes(sectionKey);
}

export const getAllContents = async (req, res) => {
  try {
    const cached = await getCache(SITE_ALL_KEY);
    if (cached) {
      return res.status(200).json({ success: true, contents: cached.contents, source: "cache" });
    }
    const result = await getAllSiteContents();
    await setCache(SITE_ALL_KEY, { contents: result.rows }, CACHE_TTL_SECONDS);
    return res.status(200).json({ success: true, contents: result.rows });
  } catch (error) {
    console.error("Error fetching site contents:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to fetch site contents" });
  }
};
export const getContentByPageKey = async (req, res) => {
  try {
    const pageKey = req.params.page_key;
    if (!pageKey) {
      return res.status(400).json({ success: false, message: "page_key is required" });
    }
    const cacheKey = buildPageCacheKey(pageKey);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, source: "cache", page_key: cached.page_key, contents: cached.contents });
    }
    const result = await getSiteContentsByPageKey(pageKey);
    const payload = { page_key: pageKey, contents: result.rows };
    await setCache(cacheKey, payload, CACHE_TTL_SECONDS);
    return res.status(200).json({ success: true, ...payload });
  } catch (error) {
    console.error("Error fetching site content by page:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to fetch page content" });
  }
};
export const createContent = async (req, res) => { // Handle create endpoint
  try { // Start safe handler
    // Parse JSON content from body (may be string if sent via FormData)
    let { page_key, section_key, content } = req.body || {}; // Extract payload fields

    // If content is a string (from FormData), parse it
    if (typeof content === "string") {
      try {
        content = JSON.parse(content); // Parse JSON string to object
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid content JSON format" }); // Return parse error
      }
    }

    if (!page_key || !section_key) { // Validate required keys
      return res.status(400).json({ success: false, message: "page_key and section_key are required" }); // Return validation error
    } // End validation
    if (!isAllowedSection(page_key, section_key)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section_key "${section_key}" for page_key "${page_key}". Use a section key allowed for this page.`,
      });
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ success: false, message: "content must be a JSON object" });
    }

    await deleteCache(buildPageCacheKey(page_key));
    await deleteCache(SITE_ALL_KEY);

    // Handle image upload if file is provided
    const imageFile = req.file; // Get uploaded image file from multer
    let image_url = null; // Initialize image URL
    let image_public_id = null; // Initialize image public ID

    if (imageFile) { // Check if image was uploaded
      try {
        // Upload image to Cloudinary
        const imageUpload = await cloudinaryUpload(
          imageFile.path, // Path to temporary file
          `site-content/${page_key}`, // Folder name in Cloudinary
          `siteContent-${page_key}-${section_key}` // Public ID for the image
        );
        image_url = imageUpload?.uploadResult?.url || null; // Get optimized URL
        image_public_id = imageUpload?.uploadResult?.public_id || null; // Get public ID for future deletion
      } catch (uploadError) { // Handle upload errors
        console.error("Error uploading image:", uploadError); // Log upload error
        return res.status(500).json({ success: false, message: "Failed to upload image" }); // Return upload error
      }
    }

    const result = await createSiteContent({ page_key, section_key, content, image_url, image_public_id });
    return res.status(201).json({ success: true, message: "Site content created", content: result.rows[0] });
  } catch (error) { // Handle unexpected errors
    // if (error?.code === "SECTION_LIMIT_EXCEEDED") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This page already has 2 sections. Cannot add more.",
    //   });
    // }

    // if (error?.code === "23505") { // Handle unique constraint violation
    //   return res.status(409).json({ success: false, message: "That page/section already exists" }); // Return conflict response
    // } // End conflict handling
    console.error("Error creating site content:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to create site content" }); // Return error response
  } // End error handling
}; // End createContent
export const updateContent = async (req, res) => { // Handle update endpoint
  try { // Start safe handler
    const { id } = req.params; // Read id from params

    // First, get existing site content to check for existing image
    const existingResult = await pool.query("SELECT image_public_id, page_key FROM site_contents WHERE id = $1", [id]); // Query existing record
    if (existingResult.rowCount === 0) { // Check if record exists
      return res.status(404).json({ success: false, message: "Site content not found" }); // Return not found
    } // End existence check

    const existingPublicId = existingResult.rows[0].image_public_id; // Get existing image public ID
    const pageKey = existingResult.rows[0].page_key; // Get page key for cache invalidation

    // Parse JSON content from body (may be string if sent via FormData)
    let { content, remove_image } = req.body || {}; // Extract updated content and remove_image flag

    // If content is a string (from FormData), parse it
    if (typeof content === "string") {
      try {
        content = JSON.parse(content); // Parse JSON string to object
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid content JSON format" }); // Return parse error
      }
    }

    if (!id || Number.isNaN(Number(id))) { // Validate id
      return res.status(400).json({ success: false, message: "Valid id is required" }); // Return validation error
    } // End validation
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ success: false, message: "content must be a JSON object" });
    }

    await deleteCache(buildPageCacheKey(pageKey));
    await deleteCache(SITE_ALL_KEY);

    // Handle image upload/replacement/removal
    const imageFile = req.file; // Get uploaded image file from multer
    let image_url = null; // Initialize image URL
    let image_public_id = null; // Initialize image public ID

    if (imageFile) { // Check if new image was uploaded
      // Delete old image from Cloudinary if it exists
      if (existingPublicId) {
        try {
          await cloudinaryDelete(existingPublicId); // Delete old image
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError); // Log deletion error (non-fatal)
        }
      }

      // Upload new image to Cloudinary
      try {
        const imageUpload = await cloudinaryUpload(
          imageFile.path, // Path to temporary file
          `site-content/${pageKey}`, // Folder name in Cloudinary
          `siteContent-${pageKey}-${Date.now()}` // Public ID with timestamp for uniqueness
        );
        image_url = imageUpload?.uploadResult?.url || null; // Get optimized URL
        image_public_id = imageUpload?.uploadResult?.public_id || null; // Get public ID
      } catch (uploadError) { // Handle upload errors
        console.error("Error uploading image:", uploadError); // Log upload error
        return res.status(500).json({ success: false, message: "Failed to upload image" }); // Return upload error
      }
    } else if (remove_image === "true" || remove_image === true) { // Check if image removal was requested
      // Delete existing image from Cloudinary
      if (existingPublicId) {
        try {
          await cloudinaryDelete(existingPublicId); // Delete image from Cloudinary
        } catch (deleteError) {
          console.error("Error deleting image:", deleteError); // Log deletion error (non-fatal)
        }
      }
      // Set image fields to null to remove from database
      image_url = null;
      image_public_id = null;
    } else {
      // Keep existing image (don't update image fields)
      // We'll pass undefined to indicate no image update
      image_url = undefined;
      image_public_id = undefined;
    }

    // Update content (and image if provided)
    const result = await updateSiteContentById(Number(id), content, image_url, image_public_id); // Update content by id (pass undefined to keep existing image, null to remove, or string to update)
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Site content not found" });
    }
    return res.status(200).json({ success: true, message: "Site content updated", content: result.rows[0] });
  } catch (error) { // Handle unexpected errors
    console.error("Error updating site content:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to update site content" }); // Return error response
  } // End error handling
}; // End updateContent
export const deleteContent = async (req, res) => { // Handle delete endpoint
  try { // Start safe handler
    const { id } = req.params; // Read id from params
    if (!id || Number.isNaN(Number(id))) { // Validate id
      return res.status(400).json({ success: false, message: "Valid id is required" }); // Return validation error
    } // End validation

    // First, get the site content to retrieve image public_id before deletion
    const existingResult = await pool.query("SELECT image_public_id, page_key FROM site_contents WHERE id = $1", [id]); // Query existing record
    if (existingResult.rowCount === 0) { // Check if record exists
      return res.status(404).json({ success: false, message: "Site content not found" }); // Return not found
    } // End existence check

    const existingPublicId = existingResult.rows[0].image_public_id;
    const pageKey = existingResult.rows[0].page_key;

    await deleteCache(buildPageCacheKey(pageKey));
    await deleteCache(SITE_ALL_KEY);

    // Delete image from Cloudinary if it exists
    if (existingPublicId) {
      try {
        await cloudinaryDelete(existingPublicId); // Delete image from Cloudinary
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError); // Log deletion error (non-fatal, continue with DB deletion)
      }
    }

    const result = await deleteSiteContentById(Number(id));
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Site content not found" });
    }
    return res.status(200).json({ success: true, message: "Site content deleted" });
  } catch (error) { // Handle unexpected errors
    console.error("Error deleting site content:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to delete site content" }); // Return error response
  } // End error handling
}; // End deleteContent
