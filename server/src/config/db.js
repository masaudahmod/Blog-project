import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  query_timeout: 30000, // Query timeout in milliseconds (30 seconds)
  statement_timeout: 30000, // Statement timeout in milliseconds (30 seconds)
  // Retry configuration
  allowExitOnIdle: false, // Don't exit when pool is idle
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
  // Don't exit the process, just log the error
});

// Test connection on startup
let isConnected = false;
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to the database");
    isConnected = true;
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    console.error("Connection details:", {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port,
    });
    isConnected = false;
    // Don't exit - let the app continue and retry on first query
  });

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
