import dotevn from "dotenv";
dotevn.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/demodb";
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

