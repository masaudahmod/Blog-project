import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

let connectPromise = null;

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error?.message || error);
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

// Lazy connect: only connect on first use (safe for Vercel serverless cold starts)
async function ensureConnected() {
  if (redisClient.isOpen && redisClient.isReady) return true;
  if (connectPromise) return connectPromise;
  connectPromise = redisClient.connect().catch((error) => {
    console.error("Redis connect failed:", error?.message || error);
    connectPromise = null;
    return null;
  });
  return connectPromise;
}

if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis connection closed");
    }
    process.exit(0);
  });
}

export const getCache = async (key) => {
  if (!(await ensureConnected())) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Redis get error:", error?.message || error);
    return null;
  }
};
export const setCache = async (key, value, ttlSeconds) => {
  if (!(await ensureConnected())) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (error) {
    console.error("Redis set error:", error?.message || error);
    return false;
  }
};
export const deleteCache = async (key) => {
  if (!(await ensureConnected())) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis delete error:", error?.message || error);
    return false;
  }
};
export { redisClient };

function isRedisUsable() {
  return redisClient.isOpen && redisClient.isReady;
}
