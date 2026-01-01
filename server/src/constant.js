import dotevn from "dotenv";
dotevn.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/demodb";
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const CLOUD_NAME = process.env.CLOUD_NAME || "your_cloud_name";
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY || "your_cloud_api_key";
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || "your_cloud_api_secret";

export const NODEMAILER_USER = process.env.NODEMAILER_EMAIL || "your_nodemailer_user";
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS || "your_nodemailer_pass";