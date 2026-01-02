import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const userExists = await findUserByEmail(email);
  if (userExists.rows.length > 0)
    return res.status(400).json({ message: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  const newUser = await createUser(name, email, hash);
  res
    .status(201)
    .json({ message: "Admin registered successfully", user: newUser.rows[0] });
};

// register team member / writer / editor
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check email exists
    const userExists = await findUserByEmail(email);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user with role & pending status
    const newUser = await pool.query(
      `
    INSERT INTO users (name, email, password, role, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING id, name, email, role, status
    `,
      [name, email, hash, role]
    );

    // response
    res.status(201).json({
      message: "Registration successful. Please wait for admin confirmation.",
    });
  } catch (error) {
    console.log("error registerUser", error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await findUserByEmail(email);
    if (user.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    // check status
    if (user.rows[0].status !== "active") {
      return res.status(403).json({
        message:
          "Your account is not active yet. Please wait for admin approval.",
      });
    }

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json({ message: "Invalid Password" });

    const token = generateToken(user.rows[0]);

    console.log(user.rows[0].name, "- logged in");

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res
      .status(200)
      .json({ message: "Login successful", token, user: user.rows[0] });
  } catch (error) {
    console.log("error login", error);
  }
};

export const allUsers = async (req, res) => {
  const users = await findUserByEmail();
  res.json(users.rows);
};

export const currentUser = async (req, res) => {
  try {
    const token =
      req.headers.cookie?.split("=")[1] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );
    res.status(200).json({ message: "Current user", user: result.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error in current user", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    console.log(req.user.email, "- logged out");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Server Error in logout", error: error.message });
  }
};

// admin activates user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      `
    UPDATE users
    SET status = 'active'
    WHERE id = $1
    `,
      [userId]
    );

    res.status(200).json({ message: "User activated successfully" });
  } catch (error) {
    console.log("error activateUser", error);
  }
};
