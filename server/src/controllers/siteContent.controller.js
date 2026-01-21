import { getCache, setCache, deleteCache } from "../config/redis.js"; // Import Redis cache helpers
import { createSiteContent, deleteSiteContentById, getAllSiteContents, getSiteContentsByPageKey, updateSiteContentById } from "../models/siteContent.model.js"; // Import model helpers
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
    const { page_key, section_key, content } = req.body || {}; // Extract payload fields
    if (!page_key || !section_key) { // Validate required keys
      return res.status(400).json({ success: false, message: "page_key and section_key are required" }); // Return validation error
    } // End validation
    if (!content || typeof content !== "object" || Array.isArray(content)) { // Validate content object
      return res.status(400).json({ success: false, message: "content must be a JSON object" }); // Return validation error
    } // End validation
    const result = await createSiteContent({ page_key, section_key, content }); // Insert new content row
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
    const { content } = req.body || {}; // Extract updated content
    if (!id || Number.isNaN(Number(id))) { // Validate id
      return res.status(400).json({ success: false, message: "Valid id is required" }); // Return validation error
    } // End validation
    if (!content || typeof content !== "object" || Array.isArray(content)) { // Validate content object
      return res.status(400).json({ success: false, message: "content must be a JSON object" }); // Return validation error
    } // End validation
    const result = await updateSiteContentById(Number(id), content); // Update content by id
    if (result.rowCount === 0) { // Handle missing record
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
    const result = await deleteSiteContentById(Number(id)); // Delete row by id
    if (result.rowCount === 0) { // Handle missing record
      return res.status(404).json({ success: false, message: "Site content not found" }); // Return not found
    } // End missing handling
    const deleted = result.rows[0]; // Read deleted row
    await deleteCache(buildPageCacheKey(deleted.page_key)); // Invalidate cache for page
    return res.status(200).json({ success: true, message: "Site content deleted" }); // Return success response
  } catch (error) { // Handle unexpected errors
    console.error("Error deleting site content:", error?.message || error); // Log error for debugging
    return res.status(500).json({ success: false, message: "Failed to delete site content" }); // Return error response
  } // End error handling
}; // End deleteContent
