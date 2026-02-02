import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const isVercel = !!process.env.VERCEL;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || isVercel ? { rejectUnauthorized: false } : false,
  // Smaller pool on Vercel/serverless to avoid exhausting DB connections
  max: isVercel ? 2 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
});

// Only test connection on startup when NOT on Vercel (avoids cold-start failures)
if (!isVercel) {
  pool
    .connect()
    .then((client) => {
      console.log("✅ Connected to the database");
      client.release();
    })
    .catch((err) => {
      console.error("❌ Database connection error:", err.message);
    });
}

// Helper function to check connection health
export const checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error.message);
    return false;
  }
};

export default pool;
