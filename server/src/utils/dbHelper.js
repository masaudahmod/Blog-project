import pool from "../config/db.js";

/**
 * Execute a database query with retry logic
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise} Query result
 */
export const queryWithRetry = async (query, params = [], maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors (syntax errors, constraint violations, etc.)
      if (
        error.code === "23505" || // Unique constraint violation
        error.code === "23503" || // Foreign key constraint violation
        error.code === "42P01" || // Undefined table
        error.code === "42703"    // Undefined column
      ) {
        throw error;
      }
      
      // Only retry on connection/timeout errors
      const isRetryableError = 
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.code === "57014" ||
        error.message?.includes("timeout") ||
        error.message?.includes("connection");
      
      if (!isRetryableError) {
        throw error;
      }
      
      // Log retry attempt
      if (attempt < maxRetries) {
        console.warn(
          `Database query failed (attempt ${attempt}/${maxRetries}):`,
          error.message,
          `Retrying in ${retryDelay}ms...`
        );
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        
        // Exponential backoff
        retryDelay *= 2;
      }
    }
  }
  
  // All retries failed
  console.error(`Database query failed after ${maxRetries} attempts:`, lastError);
  throw lastError;
};

/**
 * Check if database connection is healthy
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const isDatabaseHealthy = async () => {
  try {
    const result = await pool.query("SELECT 1 as health_check");
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
};
