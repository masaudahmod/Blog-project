import { getCache, setCache, deleteCache } from "../config/redis.js"; // Import Redis cache helpers
import { createSiteContent, deleteSiteContentById, getAllSiteContents, getSiteContentsByPageKey, updateSiteContentById } from "../models/siteContent.model.js"; // Import model helpers
import { cloudinaryUpload, cloudinaryDelete } from "../service/cloudinary.js"; // Import Cloudinary service for image uploads
import pool from "../config/db.js"; // Import database pool for queries
const CACHE_TTL_SECONDS = 600; // Set cache TTL to 10 minutes
const buildPageCacheKey = (pageKey) => `site:page:${pageKey}`; // Build Redis cache key
export const getAllContents = async (req, res) => { // Handle list-all endpoint
  try { // Start safe handler
    const result = await getAllSiteContents(); // Fetch all rows from database
    return res.status(200).json({ success: true, contents: result.rows }); // Return contents list
  } catch (error) { // Handle unexpected errors
    console.error("Error fetching site contents:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to fetch site contents" }); // Return error response
  } // End error handling
}; // End getAllContents
export const getContentByPageKey = async (req, res) => { // Handle page content fetch
  try { // Start safe handler
    const pageKey = req.params.page_key; // Read page key from params
    if (!pageKey) { // Validate required page key
      return res.status(400).json({ success: false, message: "page_key is required" }); // Return validation error
    } // End validation
    const cacheKey = buildPageCacheKey(pageKey); // Build cache key
    const cachedValue = await getCache(cacheKey); // Attempt Redis cache read
    if (cachedValue) { // Check cache hit
      const cachedData = JSON.parse(cachedValue); // Parse cached JSON payload
      return res.status(200).json({ success: true, source: "cache", ...cachedData }); // Return cached response
    } // End cache hit handling
    const result = await getSiteContentsByPageKey(pageKey); // Fetch rows from database
    const payload = { page_key: pageKey, contents: result.rows }; // Prepare response payload
    await setCache(cacheKey, JSON.stringify(payload), CACHE_TTL_SECONDS); // Store response in Redis
    return res.status(200).json({ success: true, source: "database", ...payload }); // Return fresh response
  } catch (error) { // Handle unexpected errors
    console.error("Error fetching site content by page:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to fetch page content" }); // Return error response
  } // End error handling
}; // End getContentByPageKey
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
    if (!content || typeof content !== "object" || Array.isArray(content)) { // Validate content object
      return res.status(400).json({ success: false, message: "content must be a JSON object" }); // Return validation error
    } // End validation
    
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
    
    const result = await createSiteContent({ page_key, section_key, content, image_url, image_public_id }); // Insert new content row with image
    await deleteCache(buildPageCacheKey(page_key)); // Invalidate cache for the page
    return res.status(201).json({ success: true, message: "Site content created", content: result.rows[0] }); // Return created row
  } catch (error) { // Handle unexpected errors
    if (error?.code === "23505") { // Handle unique constraint violation
      return res.status(409).json({ success: false, message: "That page/section already exists" }); // Return conflict response
    } // End conflict handling
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
    if (!content || typeof content !== "object" || Array.isArray(content)) { // Validate content object
      return res.status(400).json({ success: false, message: "content must be a JSON object" }); // Return validation error
    } // End validation
    
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
    if (result.rowCount === 0) { // Handle missing record (should not happen, but check anyway)
      return res.status(404).json({ success: false, message: "Site content not found" }); // Return not found
    } // End missing handling
    const updated = result.rows[0]; // Read updated row
    await deleteCache(buildPageCacheKey(updated.page_key)); // Invalidate cache for page
    return res.status(200).json({ success: true, message: "Site content updated", content: updated }); // Return updated row
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
    
    const existingPublicId = existingResult.rows[0].image_public_id; // Get image public ID
    const pageKey = existingResult.rows[0].page_key; // Get page key for cache invalidation
    
    // Delete image from Cloudinary if it exists
    if (existingPublicId) {
      try {
        await cloudinaryDelete(existingPublicId); // Delete image from Cloudinary
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError); // Log deletion error (non-fatal, continue with DB deletion)
      }
    }
    
    const result = await deleteSiteContentById(Number(id)); // Delete row by id
    if (result.rowCount === 0) { // Handle missing record (should not happen, but check anyway)
      return res.status(404).json({ success: false, message: "Site content not found" }); // Return not found
    } // End missing handling
    await deleteCache(buildPageCacheKey(pageKey)); // Invalidate cache for page
    return res.status(200).json({ success: true, message: "Site content deleted" }); // Return success response
  } catch (error) { // Handle unexpected errors
    console.error("Error deleting site content:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to delete site content" }); // Return error response
  } // End error handling
}; // End deleteContent
