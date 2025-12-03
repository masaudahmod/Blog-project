import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import e from "express";

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

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const user = await findUserByEmail(email);
  if (user.rows.length === 0)
    return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(400).json({ message: "Invalid Password" });

  const token = generateToken(user.rows[0]);

  console.log(user.rows[0].name, "- logged in");

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Login successful", token });
};

export const allUsers = async (req, res) => {
  const users = await findUserByEmail();
  res.json(users.rows);
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};
