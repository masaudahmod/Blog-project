import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import pool from "../db.js";

const ADMIN_NAME = "Masaud Ahmod";
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "masaud@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Admin@123";

const seedAdmin = async () => {
  try {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.query(
      `
      INSERT INTO users (name, email, password, role, status)
      VALUES ($1, $2, $3, 'admin', 'active')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = 'admin',
        status = 'active'
      `,
      [ADMIN_NAME, ADMIN_EMAIL, hash]
    );

    console.log("Admin profile seeded successfully.");
    console.log("  Name:", ADMIN_NAME);
    console.log("  Email:", ADMIN_EMAIL);
    console.log("  Role: admin, Status: active");
    if (!process.env.ADMIN_SEED_PASSWORD) {
      console.log("  Default password: Admin@123 (set ADMIN_SEED_PASSWORD in .env to override)");
    }
  } catch (error) {
    console.error("Seed admin error:", error.message);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedAdmin();