import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // connection mmanagement
  // max: 10,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => console.error(`Database connection error: ${err}`));

pool
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

export default pool;
