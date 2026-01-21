import { createClient } from "redis"; // Import Redis client factory
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"; // Define Redis connection URL
const redisClient = createClient({ url: redisUrl }); // Create a Redis client instance
let isRedisReady = false; // Track whether Redis is ready
redisClient.on("ready", () => { // Listen for successful Redis connection
  isRedisReady = true; // Mark Redis as ready
}); // End ready listener
redisClient.on("error", (error) => { // Listen for Redis errors
  console.error("Redis connection error:", error?.message || error); // Log Redis errors for visibility
}); // End error listener
redisClient.connect().catch((error) => { // Attempt to connect to Redis
  console.error("Redis connect failed:", error?.message || error); // Log connection failures
}); // End connect attempt
export const getCache = async (key) => { // Define a cache read helper
  if (!isRedisReady || !redisClient.isOpen) return null; // Skip if Redis is not ready
  try { // Start safe Redis read
    const value = await redisClient.get(key); // Read cached value
    return value ? JSON.parse(value) : null; // Return parsed cached value
  } catch (error) { // Handle Redis get errors
    console.error("Redis get error:", error?.message || error); // Log get error
    return null; // Fall back to no cache
  } // End error handling
}; // End getCache helper
export const setCache = async (key, value, ttlSeconds) => { // Define a cache write helper
  if (!isRedisReady || !redisClient.isOpen) return false; // Skip if Redis is not ready
  try { // Start safe Redis write
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds }); // Set cache with expiry
    return true; // Confirm cache write
  } catch (error) { // Handle Redis set errors
    console.error("Redis set error:", error?.message || error); // Log set error
    return false; // Signal cache write failure
  } // End error handling
}; // End setCache helper
export const deleteCache = async (key) => { // Define a cache delete helper
  if (!isRedisReady || !redisClient.isOpen) return false; // Skip if Redis is not ready
  try { // Start safe Redis delete
    await redisClient.del(key); // Delete cached value
    return true; // Confirm cache delete
  } catch (error) { // Handle Redis delete errors
    console.error("Redis delete error:", error?.message || error); // Log delete error
    return false; // Signal cache delete failure
  } // End error handling
}; // End deleteCache helper
export { redisClient }; // Export Redis client for optional use
